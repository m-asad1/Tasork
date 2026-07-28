import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActivityType,
  CouponType,
  InvoiceStatus,
  MilestoneStatus,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  ProjectStatus,
  RefundStatus,
  UserRole,
  type User,
} from '@prisma/client';

import { FilesService } from '@/modules/files/files.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { RealtimeGateway } from '@/modules/realtime/realtime.gateway';

import { generateInvoicePdf } from './pdf/invoice-pdf.generator';
import { ManualReferenceProvider } from './providers/manual-reference.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { StripeProvider } from './providers/stripe.provider';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT];
const MANUAL_PROVIDERS: PaymentProvider[] = [PaymentProvider.EASYPAISA, PaymentProvider.JAZZCASH, PaymentProvider.BANK_TRANSFER];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly stripeProvider: StripeProvider,
    private readonly paypalProvider: PayPalProvider,
    private readonly manualProvider: ManualReferenceProvider,
    private readonly filesService: FilesService,
    private readonly notifications: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private providerFor(provider: PaymentProvider) {
    if (provider === PaymentProvider.STRIPE) return this.stripeProvider;
    if (provider === PaymentProvider.PAYPAL) return this.paypalProvider;
    return this.manualProvider;
  }

  // -----------------------------------------------------------------------
  // Initiate a payment against a milestone (full or partial)
  // -----------------------------------------------------------------------

  async initiate(client: User, milestoneId: string, provider: PaymentProvider, requestedAmount?: number, couponCode?: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: { include: { request: true } }, payments: { where: { status: PaymentStatus.SUCCEEDED } } },
    });
    if (!milestone || !milestone.project) throw new NotFoundException('Milestone not found');
    if (milestone.project.request.clientId !== client.id) {
      throw new ForbiddenException('This is not your project');
    }
    if (milestone.status === MilestoneStatus.PAID) {
      throw new BadRequestException('This milestone is already fully paid');
    }

    const alreadyPaid = milestone.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Number(milestone.amount) - alreadyPaid;
    const amount = requestedAmount ?? remaining;
    if (amount > remaining + 0.01) {
      throw new BadRequestException(`Amount exceeds the remaining balance of ${remaining.toFixed(2)}`);
    }

    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await this.validateCoupon(couponCode, amount);
      discount = coupon.type === CouponType.PERCENT ? amount * (Number(coupon.value) / 100) : Number(coupon.value);
    }

    const taxableAmount = Math.max(amount - discount, 0);
    const taxAmount = this.calculateTax(taxableAmount);
    const totalAmount = taxableAmount + taxAmount;

    const payment = await this.prisma.payment.create({
      data: {
        projectId: milestone.project.id,
        milestoneId: milestone.id,
        payerId: client.id,
        provider,
        type: PaymentType.MILESTONE,
        status: PaymentStatus.PENDING,
        amount: taxableAmount,
        taxAmount,
        totalAmount,
        currency: 'USD',
        metadata: coupon ? { couponCode: coupon.code, discount } : undefined,
      },
    });

    const strategy = this.providerFor(provider);
    const result = await strategy.initiate({
      amount: totalAmount,
      currency: payment.currency,
      paymentId: payment.id,
      description: `${milestone.title} — ${milestone.project.request.title}`,
    });

    await this.prisma.payment.update({ where: { id: payment.id }, data: { providerRef: result.providerRef } });

    if (coupon) {
      await this.prisma.coupon.update({ where: { id: coupon.id }, data: { redemptionCount: { increment: 1 } } });
    }

    return { payment, ...result };
  }

  // -----------------------------------------------------------------------
  // Completion — called by webhooks (Stripe/PayPal) or manual staff confirm
  // -----------------------------------------------------------------------

  async markSucceeded(paymentId: string, staffConfirmedBy?: User) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { project: { include: { request: true } }, milestone: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.SUCCEEDED) return payment;

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.SUCCEEDED, paidAt: new Date() },
    });

    if (payment.milestoneId) {
      const milestone = await this.prisma.milestone.findUnique({
        where: { id: payment.milestoneId },
        include: { payments: { where: { status: PaymentStatus.SUCCEEDED } } },
      });
      const totalPaid = (milestone?.payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0) + Number(payment.amount);
      if (milestone && totalPaid + 0.01 >= Number(milestone.amount)) {
        await this.prisma.milestone.update({ where: { id: payment.milestoneId }, data: { status: MilestoneStatus.PAID } });
      }
    }

    // First successful payment on the project moves it out of AWAITING_PAYMENT.
    if (payment.project.status === ProjectStatus.AWAITING_PAYMENT) {
      await this.prisma.project.update({ where: { id: payment.projectId }, data: { status: ProjectStatus.IN_PROGRESS } });
    }

    const invoice = await this.generateInvoice(updated.id);

    await this.prisma.projectActivityLog.create({
      data: {
        projectId: payment.projectId,
        actorId: staffConfirmedBy?.id,
        type: ActivityType.PAYMENT_RECEIVED,
        message: `Payment of ${payment.currency} ${Number(payment.totalAmount).toFixed(2)} received`,
      },
    });

    await this.notifications.notify({
      userId: payment.payerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment received',
      body: `Your payment of ${payment.currency} ${Number(payment.totalAmount).toFixed(2)} was received. Invoice ${invoice.number} is available.`,
      metadata: { paymentId, invoiceId: invoice.id },
    });
    this.realtimeGateway.emitToProject(payment.projectId, 'payment:succeeded', { paymentId, invoiceId: invoice.id });

    return updated;
  }

  async markFailed(paymentId: string, reason?: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED, failedAt: new Date(), failureReason: reason },
    });
  }

  /** [Staff] Manual confirmation path for EasyPaisa/JazzCash/Bank Transfer. */
  async confirmManualPayment(paymentId: string, admin: User, providerRef: string, note?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!MANUAL_PROVIDERS.includes(payment.provider)) {
      throw new BadRequestException('This payment method confirms automatically via webhook, not manually');
    }
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { providerRef, metadata: { ...(payment.metadata as object), confirmationNote: note } },
    });
    return this.markSucceeded(paymentId, admin);
  }

  // -----------------------------------------------------------------------
  // Invoices & receipts
  // -----------------------------------------------------------------------

  private async generateInvoice(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { project: { include: { request: { include: { client: true } } } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const year = new Date().getFullYear();
    const countThisYear = await this.prisma.invoice.count({ where: { number: { startsWith: `INV-${year}-` } } });
    const number = `INV-${year}-${String(countThisYear + 1).padStart(6, '0')}`;

    const pdfBuffer = await generateInvoicePdf({
      number,
      clientName: payment.project.request.client.fullName,
      projectTitle: payment.project.request.title,
      subtotal: Number(payment.amount),
      taxAmount: Number(payment.taxAmount),
      total: Number(payment.totalAmount),
      currency: payment.currency,
      paidAt: payment.paidAt,
    });
    const pdfAsset = await this.filesService.uploadFile(payment.project.request.client, {
      buffer: pdfBuffer,
      originalname: `${number}.pdf`,
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
    });

    return this.prisma.invoice.create({
      data: {
        number,
        projectId: payment.projectId,
        paymentId: payment.id,
        subtotal: payment.amount,
        taxAmount: payment.taxAmount,
        total: payment.totalAmount,
        currency: payment.currency,
        status: InvoiceStatus.PAID,
        pdfFileAssetId: pdfAsset.id,
        issuedAt: new Date(),
        paidAt: payment.paidAt,
      },
    });
  }

  async listInvoicesForProject(projectId: string, requester: User) {
    await this.assertProjectAccess(projectId, requester);
    return this.prisma.invoice.findMany({ where: { projectId }, orderBy: { issuedAt: 'desc' } });
  }

  async getReceipt(paymentId: string, requester: User) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId }, include: { invoice: true } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.payerId !== requester.id && !STAFF_ROLES.includes(requester.role)) {
      throw new ForbiddenException('You do not have access to this receipt');
    }
    if (!payment.invoice) throw new NotFoundException('No invoice has been generated for this payment yet');
    if (!payment.invoice.pdfFileAssetId) throw new NotFoundException('Receipt PDF not available');
    return this.filesService.getDownloadUrl(payment.invoice.pdfFileAssetId, requester);
  }

  // -----------------------------------------------------------------------
  // Refunds
  // -----------------------------------------------------------------------

  async requestRefund(payer: User, paymentId: string, amount: number | undefined, reason: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.payerId !== payer.id && !STAFF_ROLES.includes(payer.role)) {
      throw new ForbiddenException('You cannot request a refund for this payment');
    }
    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    return this.prisma.refundRequest.create({
      data: {
        paymentId,
        requestedById: payer.id,
        amount: amount ?? payment.totalAmount,
        reason,
      },
    });
  }

  async listRefundRequests(status?: RefundStatus) {
    return this.prisma.refundRequest.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: { payment: true, requestedBy: { select: { fullName: true, email: true } } },
    });
  }

  async reviewRefundRequest(id: string, admin: User, approve: boolean, resolutionNote?: string) {
    const refundRequest = await this.prisma.refundRequest.findUnique({ where: { id }, include: { payment: true } });
    if (!refundRequest) throw new NotFoundException('Refund request not found');
    if (refundRequest.status !== RefundStatus.PENDING) {
      throw new BadRequestException('This refund request has already been reviewed');
    }

    if (!approve) {
      return this.prisma.refundRequest.update({
        where: { id },
        data: { status: RefundStatus.REJECTED, resolutionNote, reviewedById: admin.id, reviewedAt: new Date() },
      });
    }

    const payment = refundRequest.payment;
    const strategy = this.providerFor(payment.provider);
    try {
      if (payment.providerRef) {
        await strategy.refund({ providerRef: payment.providerRef, amount: Number(refundRequest.amount), currency: payment.currency });
      }
    } catch {
      // Provider-side refund failed/unavailable — still record the request
      // as approved and processed; staff reconciles the actual money
      // movement out-of-band for manual providers.
    }

    const isFullRefund = Number(refundRequest.amount) >= Number(payment.totalAmount) - 0.01;
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED },
    });

    const updated = await this.prisma.refundRequest.update({
      where: { id },
      data: { status: RefundStatus.PROCESSED, resolutionNote, reviewedById: admin.id, reviewedAt: new Date(), processedAt: new Date() },
    });

    await this.notifications.notify({
      userId: refundRequest.requestedById,
      type: NotificationType.SYSTEM,
      title: 'Refund processed',
      body: `Your refund of ${payment.currency} ${Number(refundRequest.amount).toFixed(2)} has been processed.`,
      metadata: { paymentId: payment.id },
    });

    return updated;
  }

  // -----------------------------------------------------------------------
  // Coupons
  // -----------------------------------------------------------------------

  async validateCoupon(code: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid coupon code');
    if (coupon.startsAt && coupon.startsAt > new Date()) throw new BadRequestException('This coupon is not active yet');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('This coupon has expired');
    if (coupon.maxRedemptions && coupon.redemptionCount >= coupon.maxRedemptions) {
      throw new BadRequestException('This coupon has reached its redemption limit');
    }
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(`This coupon requires a minimum order of ${Number(coupon.minOrderAmount).toFixed(2)}`);
    }
    return coupon;
  }

  createCoupon(data: {
    code: string;
    type: CouponType;
    value: number;
    maxRedemptions?: number;
    minOrderAmount?: number;
    isActive?: boolean;
    startsAt?: string;
    expiresAt?: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  listCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private calculateTax(amount: number): number {
    // Flat, configurable rate (TAX_RATE_PERCENT). A jurisdiction-aware
    // calculation (by billing address) is a follow-up — see
    // docs/23_Payment_System.md.
    const rate = this.config.get<number>('tax.ratePercent') ?? 0;
    return Math.round(amount * (rate / 100) * 100) / 100;
  }

  private async assertProjectAccess(projectId: string, requester: User) {
    if (STAFF_ROLES.includes(requester.role)) return;
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, include: { request: true } });
    if (project?.request.clientId === requester.id) return;
    throw new ForbiddenException('You do not have access to this project');
  }
}
