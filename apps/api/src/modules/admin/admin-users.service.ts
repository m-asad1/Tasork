import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, type User } from '@prisma/client';

import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { role?: UserRole; search?: string; page?: number; limit?: number }) {
    const { role, search, page = 1, limit = 20 } = params;
    const where = {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        projectRequests: { select: { id: true, title: true, status: true, createdAt: true }, take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { projectRequests: true, payments: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async updateRole(id: string, role: UserRole, actor: User) {
    if (id === actor.id) {
      throw new BadRequestException('You cannot change your own role');
    }
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User not found');

    // Only a SUPER_ADMIN can create or demote other SUPER_ADMINs.
    if ((role === UserRole.SUPER_ADMIN || target.role === UserRole.SUPER_ADMIN) && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only a Super Admin can manage Super Admin accounts');
    }

    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async setActive(id: string, isActive: boolean, actor: User) {
    if (id === actor.id) {
      throw new BadRequestException('You cannot deactivate your own account here — use account settings instead');
    }
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({ where: { id }, data: { isActive } });

    if (!isActive) {
      await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    return updated;
  }
}
