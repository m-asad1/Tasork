import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileVisibility, ProjectStatus, type AuthProvider, type User } from '@prisma/client';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';

import { FilesService } from '@/modules/files/files.service';
import { MailService } from '@/modules/mail/mail.service';
import { PrismaService } from '@/modules/prisma/prisma.service';

const EMAIL_CHANGE_TOKEN_TTL_HOURS = 24;

/** Fields that count toward "profile completion" (Deliverable 51). */
const PROFILE_COMPLETION_FIELDS: Array<keyof User> = [
  'fullName',
  'avatarUrl',
  'bio',
  'phone',
  'timezone',
  'emailVerifiedAt',
];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly filesService: FilesService,
  ) {}

  findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { email: string; fullName: string; passwordHash?: string; provider?: AuthProvider; providerId?: string }) {
    return this.prisma.user.create({
      data: { ...data, email: data.email.toLowerCase() },
    });
  }

  markEmailVerified(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  }

  updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  /** Strips sensitive fields before a user object is ever returned from the API. */
  toPublic(user: User) {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  // -----------------------------------------------------------------------
  // Profile management
  // -----------------------------------------------------------------------

  async updateProfile(userId: string, data: { fullName?: string; bio?: string; phone?: string; timezone?: string }) {
    const user = await this.prisma.user.update({ where: { id: userId }, data });
    return this.toPublic(user);
  }

  async uploadAvatar(user: User, file: { buffer: Buffer; originalname: string; mimetype: string; size: number }) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Avatar must be an image file');
    }
    const fileAsset = await this.filesService.uploadFile(user, file, { visibility: FileVisibility.CLIENT_AND_TEAM });
    const { url } = await this.filesService.getDownloadUrl(fileAsset.id, user);

    const updated = await this.prisma.user.update({ where: { id: user.id }, data: { avatarUrl: url } });
    return this.toPublic(updated);
  }

  getProfileCompletion(user: User) {
    const present = PROFILE_COMPLETION_FIELDS.filter((field) => Boolean(user[field]));
    const missingFields = PROFILE_COMPLETION_FIELDS.filter((field) => !user[field]);
    return {
      percent: Math.round((present.length / PROFILE_COMPLETION_FIELDS.length) * 100),
      missingFields,
    };
  }

  // -----------------------------------------------------------------------
  // Password change (while logged in — distinct from the forgot-password flow)
  // -----------------------------------------------------------------------

  async changePassword(user: User, currentPassword: string, newPassword: string) {
    if (!user.passwordHash) {
      throw new BadRequestException('This account signs in with Google and has no password to change');
    }
    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    // Changing the password revokes every other session as a precaution.
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password changed. Please log in again on your other devices.' };
  }

  // -----------------------------------------------------------------------
  // Email change (requires confirming the *new* address)
  // -----------------------------------------------------------------------

  async requestEmailChange(user: User, newEmail: string, password: string) {
    if (user.passwordHash) {
      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid) throw new UnauthorizedException('Password is incorrect');
    }

    const existing = await this.findByEmail(newEmail);
    if (existing) throw new ConflictException('That email is already in use');

    const rawToken = nanoid(48);
    const tokenHash = await argon2.hash(rawToken);

    await this.prisma.emailChangeRequest.create({
      data: {
        userId: user.id,
        newEmail: newEmail.toLowerCase(),
        tokenHash,
        expiresAt: new Date(Date.now() + EMAIL_CHANGE_TOKEN_TTL_HOURS * 60 * 60 * 1000),
      },
    });

    const confirmUrl = `${this.config.get<string>('appUrl')}/settings/confirm-email?token=${rawToken}`;
    await this.mailService.send({
      to: newEmail,
      subject: 'Confirm your new Tasork email address',
      html: `<p>Click below to confirm this is your new email for Tasork:</p><p><a href="${confirmUrl}">Confirm new email</a></p>`,
    });

    return { message: 'Confirmation link sent to your new email address.' };
  }

  async confirmEmailChange(rawToken: string) {
    const candidates = await this.prisma.emailChangeRequest.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
    });

    let match: (typeof candidates)[number] | null = null;
    for (const candidate of candidates) {
      if (await argon2.verify(candidate.tokenHash, rawToken)) {
        match = candidate;
        break;
      }
    }
    if (!match) throw new BadRequestException('This confirmation link is invalid or has expired');

    const stillAvailable = await this.findByEmail(match.newEmail);
    if (stillAvailable) throw new ConflictException('That email is no longer available');

    await this.prisma.$transaction([
      this.prisma.emailChangeRequest.update({ where: { id: match.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({
        where: { id: match.userId },
        data: { email: match.newEmail, emailVerifiedAt: new Date() },
      }),
    ]);

    return { message: 'Email address updated.' };
  }

  // -----------------------------------------------------------------------
  // Account deletion (soft delete — preserves referential integrity for
  // projects/payments/audit history rather than hard-deleting a user row)
  // -----------------------------------------------------------------------

  async deleteAccount(user: User, password: string) {
    if (user.passwordHash) {
      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid) throw new UnauthorizedException('Password is incorrect');
    }

    const activeProjectCount = await this.prisma.project.count({
      where: {
        request: { clientId: user.id },
        status: {
          in: [
            ProjectStatus.AWAITING_PAYMENT,
            ProjectStatus.IN_PROGRESS,
            ProjectStatus.IN_REVIEW,
            ProjectStatus.REVISION,
          ],
        },
      },
    });
    if (activeProjectCount > 0) {
      throw new ForbiddenException(
        'You have active projects in progress. Please contact support to close them before deleting your account.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          email: `deleted+${user.id}@tasork.invalid`,
          passwordHash: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Account deleted.' };
  }

  // -----------------------------------------------------------------------
  // Sessions & login history
  // -----------------------------------------------------------------------

  async listActiveSessions(userId: string, rawCurrentRefreshToken?: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      sessions.map(async (s) => ({
        id: s.id,
        label: s.label,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        isCurrent: rawCurrentRefreshToken ? await argon2.verify(s.tokenHash, rawCurrentRefreshToken) : false,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    );
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      throw new ForbiddenException('Session not found');
    }
    await this.prisma.refreshToken.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
    return { message: 'Session revoked.' };
  }

  listLoginHistory(userId: string, limit = 20) {
    return this.prisma.loginHistoryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
