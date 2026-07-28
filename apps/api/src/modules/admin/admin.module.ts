import { Module } from '@nestjs/common';

import { DisputesModule } from '@/modules/disputes/disputes.module';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

/**
 * Deliverable 58 in full is spread across several modules by design — each
 * owns its own domain logic and staff-only endpoints (ProjectsService
 * .reviewRequest/.assignMember, ProposalsService.create/.send,
 * PaymentsService.confirmManualPayment/.reviewRefundRequest/.createCoupon,
 * DisputesService.resolve). This module adds the two pieces that don't
 * belong anywhere else: user management, and disputes (wired in via
 * DisputesModule rather than duplicated here).
 */
@Module({
  imports: [DisputesModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminModule {}
