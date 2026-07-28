import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '@/modules/auth/decorators/roles.decorator';

import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '[Staff] Summary widgets for the analytics dashboard' })
  overview() {
    return this.analyticsService.getOverview();
  }

  @Get('revenue')
  @ApiOperation({ summary: '[Staff] Revenue over time' })
  revenue(@Query('days') days?: string) {
    return this.analyticsService.getRevenueOverTime(days ? parseInt(days, 10) : 30);
  }

  @Get('projects')
  @ApiOperation({ summary: '[Staff] Project counts by status' })
  projects() {
    return this.analyticsService.getProjectStats();
  }

  @Get('conversion')
  @ApiOperation({ summary: '[Staff] Request-to-project conversion funnel' })
  conversion(@Query('days') days?: string) {
    return this.analyticsService.getConversionFunnel(days ? parseInt(days, 10) : 90);
  }

  @Get('proposal-acceptance')
  @ApiOperation({ summary: '[Staff] Proposal acceptance rate' })
  proposalAcceptance(@Query('days') days?: string) {
    return this.analyticsService.getProposalAcceptanceRate(days ? parseInt(days, 10) : 90);
  }

  @Get('retention')
  @ApiOperation({ summary: '[Staff] Customer retention rate' })
  retention() {
    return this.analyticsService.getCustomerRetention();
  }

  @Get('active-users')
  @ApiOperation({ summary: '[Staff] Daily/weekly/monthly active users' })
  activeUsers() {
    return this.analyticsService.getActiveUsers();
  }
}
