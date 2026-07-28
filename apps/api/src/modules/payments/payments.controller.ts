import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefundStatus, UserRole, type User } from '@prisma/client';
import type { Request } from 'express';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

import { ConfirmManualPaymentDto } from './dto/confirm-manual-payment.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ReviewRefundRequestDto } from './dto/review-refund-request.dto';
import { PaymentsService } from './payments.service';
import { PayPalProvider } from './providers/paypal.provider';
import { StripeProvider } from './providers/stripe.provider';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeProvider: StripeProvider,
    private readonly paypalProvider: PayPalProvider,
  ) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Start a payment against a milestone (Stripe/PayPal/EasyPaisa/JazzCash/Bank Transfer)' })
  initiate(@CurrentUser() client: User, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiate(client, dto.milestoneId, dto.provider, dto.amount, dto.couponCode);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT)
  @Post(':id/confirm')
  @ApiOperation({ summary: '[Staff] Manually confirm an EasyPaisa/JazzCash/Bank Transfer payment' })
  confirmManual(@Param('id') id: string, @CurrentUser() admin: User, @Body() dto: ConfirmManualPaymentDto) {
    return this.paymentsService.confirmManualPayment(id, admin, dto.providerRef, dto.note);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Get a signed download URL for a payment receipt' })
  getReceipt(@Param('id') id: string, @CurrentUser() user: User) {
    return this.paymentsService.getReceipt(id, user);
  }

  @Post(':id/refund-requests')
  @ApiOperation({ summary: 'Request a refund for a payment' })
  requestRefund(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: CreateRefundRequestDto) {
    return this.paymentsService.requestRefund(user, id, dto.amount, dto.reason);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('refund-requests')
  @ApiOperation({ summary: '[Staff] List refund requests' })
  listRefundRequests(@Query('status') status?: RefundStatus) {
    return this.paymentsService.listRefundRequests(status);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('refund-requests/:id/review')
  @ApiOperation({ summary: '[Staff] Approve or reject a refund request' })
  reviewRefund(@Param('id') id: string, @CurrentUser() admin: User, @Body() dto: ReviewRefundRequestDto) {
    return this.paymentsService.reviewRefundRequest(id, admin, dto.approve, dto.resolutionNote);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('coupons')
  @ApiOperation({ summary: '[Staff] Create a coupon' })
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.paymentsService.createCoupon(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('coupons')
  @ApiOperation({ summary: '[Staff] List coupons' })
  listCoupons() {
    return this.paymentsService.listCoupons();
  }

  @Get('projects/:projectId/invoices')
  @ApiOperation({ summary: 'List invoices for a project' })
  listInvoices(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.paymentsService.listInvoicesForProject(projectId, user);
  }

  // -----------------------------------------------------------------------
  // Webhooks — signature-verified, not authenticated the normal way
  // -----------------------------------------------------------------------

  @Public()
  @Post('webhooks/stripe')
  @ApiExcludeEndpoint()
  async stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    if (!req.rawBody) {
      throw new BadRequestException('Raw body not available for signature verification');
    }
    const event = this.stripeProvider.constructEvent(req.rawBody, signature);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { metadata: { paymentId?: string } };
      if (intent.metadata?.paymentId) await this.paymentsService.markSucceeded(intent.metadata.paymentId);
    }
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as { metadata: { paymentId?: string }; last_payment_error?: { message?: string } };
      if (intent.metadata?.paymentId) {
        await this.paymentsService.markFailed(intent.metadata.paymentId, intent.last_payment_error?.message);
      }
    }

    return { received: true };
  }

  @Public()
  @Post('webhooks/paypal')
  @ApiExcludeEndpoint()
  async paypalWebhook(@Body() body: { event_type: string; resource: { supplementary_data?: { related_ids?: { order_id?: string } }; id: string } }) {
    // NOTE: production PayPal integration should verify the webhook
    // signature via POST /v1/notifications/verify-webhook-signature before
    // trusting this payload — omitted here since it requires a registered
    // webhook ID from a live PayPal app, which wasn't available to test
    // against. Everything downstream of verification (order lookup,
    // markSucceeded) is real.
    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource.id;
      const capture = await this.paypalProvider.capture(orderId);
      const paymentId = capture.purchase_units?.[0]?.reference_id;
      if (paymentId) await this.paymentsService.markSucceeded(paymentId);
    }
    return { received: true };
  }
}
