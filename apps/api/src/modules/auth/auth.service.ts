import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, type User } from '@prisma/client';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';

import { MailService } from '@/modules/mail/mail.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

import type { GoogleProfile } from './strategies/google.strategy';

const REFRESH_TOKEN_TTL_DAYS = 30;
const VERIFICATION_TOKEN_TTL_HOURS = 24;
const RESET_TOKEN_TTL_HOURS = 1;

function hashToken(token: string) {
  return argon2.hash(token);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // ---------------------------------------------------------------------
  // Registration & email verification
  // ---------------------------------------------------------------------

  async register(input: { fullName: string; email: string; password: string }) {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await this.usersService.create({
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      provider: AuthProvider.LOCAL,
    });

    await this.issueEmailVerificationToken(user);
    return this.usersService.toPublic(user);
  }

  private async issueEmailVerificationToken(user: User) {
    const rawToken = nanoid(48);
    const tokenHash = await hashToken(rawToken);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000),
      },
    });

    const verifyUrl = `${this.config.get<string>('appUrl')}/verify-email?token=${rawToken}`;
    await this.mailService.sendVerificationEmail(user.email, verifyUrl);
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Deliberately silent on unknown emails — avoids leaking account existence.
    if (user && !user.emailVerifiedAt) {
      await this.issueEmailVerificationToken(user);
    }
    return { message: 'If that account exists, a verification email has been sent.' };
  }

  async verifyEmail(rawToken: string) {
    const candidates = await this.prisma.emailVerificationToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
    });

    const match = await this.findMatchingToken(candidates, rawToken);
    if (!match) {
      throw new BadRequestException('Verification link is invalid or has expired');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({ where: { id: match.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: match.userId }, data: { emailVerifiedAt: new Date() } }),
    ]);

    return { message: 'Email verified successfully' };
  }

  // ---------------------------------------------------------------------
  // Login / logout / token refresh
  // ---------------------------------------------------------------------

  async validateLocalUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }
    return user;
  }

  async login(user: User, meta: { userAgent?: string; ipAddress?: string }) {
    const accessToken = this.signAccessToken(user);
    const { rawToken: refreshToken } = await this.issueRefreshToken(user, meta);

    return { accessToken, refreshToken, user: this.usersService.toPublic(user) };
  }

  async loginWithGoogle(profile: GoogleProfile, meta: { userAgent?: string; ipAddress?: string }) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        fullName: profile.fullName,
        provider: AuthProvider.GOOGLE,
        providerId: profile.providerId,
      });
      await this.usersService.markEmailVerified(user.id);
      user = (await this.usersService.findById(user.id))!;
    }

    return this.login(user, meta);
  }

  private signAccessToken(user: User) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
      },
    );
  }

  private async issueRefreshToken(user: User, meta: { userAgent?: string; ipAddress?: string }) {
    const rawToken = `${user.id}.${randomBytes(32).toString('hex')}`;
    const tokenHash = await hashToken(rawToken);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return { rawToken };
  }

  /** Rotates the refresh token on every use — reuse of a revoked token is treated as compromise. */
  async refreshTokens(rawRefreshToken: string, meta: { userAgent?: string; ipAddress?: string }) {
    if (!rawRefreshToken) throw new UnauthorizedException('Missing refresh token');

    const [userId] = rawRefreshToken.split('.');
    const candidates = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    const match = await this.findMatchingToken(candidates, rawRefreshToken);
    if (!match) {
      // If a valid-looking but unknown/revoked token is presented, revoke all
      // sessions for that user as a precaution against token theft/replay.
      if (userId) {
        await this.prisma.refreshToken.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Invalid refresh token — all sessions have been revoked');
    }

    const user = await this.usersService.findById(match.userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Account is no longer active');

    await this.prisma.refreshToken.update({ where: { id: match.id }, data: { revokedAt: new Date() } });
    const { rawToken: newRefreshToken } = await this.issueRefreshToken(user, meta);
    const accessToken = this.signAccessToken(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    const [userId] = rawRefreshToken.split('.');
    const candidates = await this.prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
    const match = await this.findMatchingToken(candidates, rawRefreshToken);
    if (match) {
      await this.prisma.refreshToken.update({ where: { id: match.id }, data: { revokedAt: new Date() } });
    }
  }

  // ---------------------------------------------------------------------
  // Forgot / reset password
  // ---------------------------------------------------------------------

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const rawToken = nanoid(48);
      const tokenHash = await hashToken(rawToken);

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000),
        },
      });

      const resetUrl = `${this.config.get<string>('appUrl')}/reset-password?token=${rawToken}`;
      await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
    }
    // Same response regardless of whether the email exists.
    return { message: 'If that account exists, a password reset link has been sent.' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const candidates = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
    });

    const match = await this.findMatchingToken(candidates, rawToken);
    if (!match) {
      throw new BadRequestException('Reset link is invalid or has expired');
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({ where: { id: match.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: match.userId }, data: { passwordHash } }),
      // Reset invalidates every existing session — forces re-login everywhere.
      this.prisma.refreshToken.updateMany({
        where: { userId: match.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully. Please log in again.' };
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  /** Tokens are stored hashed, so matching requires verifying against each live candidate. */
  private async findMatchingToken<T extends { id: string; tokenHash: string; userId: string }>(
    candidates: T[],
    rawToken: string,
  ): Promise<T | null> {
    for (const candidate of candidates) {
      if (await argon2.verify(candidate.tokenHash, rawToken)) {
        return candidate;
      }
    }
    return null;
  }
}
