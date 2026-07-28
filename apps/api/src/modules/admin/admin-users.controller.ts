import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, type User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

import { AdminUsersService } from './admin-users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('admin')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: '[Staff] List/search users' })
  list(
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminUsersService.list({
      role,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Staff] Get a user profile with project/payment summary' })
  getById(@Param('id') id: string) {
    return this.adminUsersService.getById(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: '[Staff] Change a user role' })
  updateRole(@Param('id') id: string, @CurrentUser() actor: User, @Body() dto: UpdateUserRoleDto) {
    return this.adminUsersService.updateRole(id, dto.role, actor);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: '[Staff] Deactivate a user account' })
  deactivate(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.adminUsersService.setActive(id, false, actor);
  }

  @Post(':id/reactivate')
  @ApiOperation({ summary: '[Staff] Reactivate a user account' })
  reactivate(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.adminUsersService.setActive(id, true, actor);
  }
}
