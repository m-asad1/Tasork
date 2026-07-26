import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, type User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

import { CreateProposalDto } from './dto/create-proposal.dto';
import { DeclineProposalDto } from './dto/decline-proposal.dto';
import { ProposalsService } from './proposals.service';

@ApiTags('proposals')
@Controller()
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('projects/requests/:requestId/proposals')
  @ApiOperation({ summary: '[Staff] Build a proposal (or a new revision) for a request' })
  create(@Param('requestId') requestId: string, @CurrentUser() admin: User, @Body() dto: CreateProposalDto) {
    return this.proposalsService.create(admin, requestId, dto);
  }

  @Get('projects/requests/:requestId/proposals')
  @ApiOperation({ summary: 'Get the full version history of proposals for a request' })
  history(@Param('requestId') requestId: string, @CurrentUser() user: User) {
    return this.proposalsService.getVersionHistory(requestId, user);
  }

  @Get('proposals/:id')
  @ApiOperation({ summary: 'Get a single proposal' })
  getOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.proposalsService.getById(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('proposals/:id/send')
  @ApiOperation({ summary: '[Staff] Send a draft proposal to the client (generates the PDF)' })
  send(@Param('id') id: string, @CurrentUser() admin: User, @Query('expiresAt') expiresAt?: string) {
    return this.proposalsService.send(id, admin, expiresAt);
  }

  @Post('proposals/:id/accept')
  @ApiOperation({ summary: 'Client accepts a proposal — creates the live project' })
  accept(@Param('id') id: string, @CurrentUser() client: User) {
    return this.proposalsService.accept(id, client);
  }

  @Post('proposals/:id/decline')
  @ApiOperation({ summary: 'Client declines a proposal' })
  decline(@Param('id') id: string, @CurrentUser() client: User, @Body() dto: DeclineProposalDto) {
    return this.proposalsService.decline(id, client, dto.reason);
  }
}
