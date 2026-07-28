import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DisputeStatus, UserRole, type User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputesService } from './disputes.service';

@ApiTags('disputes')
@Controller()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('projects/:projectId/disputes')
  @ApiOperation({ summary: 'Raise a dispute on a project' })
  raise(@Param('projectId') projectId: string, @CurrentUser() user: User, @Body() dto: CreateDisputeDto) {
    return this.disputesService.raise(projectId, user, dto.subject, dto.description);
  }

  @Get('disputes/:id')
  @ApiOperation({ summary: 'Get a single dispute' })
  getById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.disputesService.getById(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT)
  @Get('admin/disputes')
  @ApiOperation({ summary: '[Staff] List disputes' })
  list(@Query('status') status?: DisputeStatus) {
    return this.disputesService.list(status);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT)
  @Post('admin/disputes/:id/under-review')
  @ApiOperation({ summary: '[Staff] Mark a dispute as under review' })
  markUnderReview(@Param('id') id: string) {
    return this.disputesService.markUnderReview(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/disputes/:id/resolve')
  @ApiOperation({ summary: '[Staff] Resolve or reject a dispute' })
  resolve(@Param('id') id: string, @CurrentUser() admin: User, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolve(id, admin, dto.status, dto.resolutionNote);
  }
}
