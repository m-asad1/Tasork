import { randomInt } from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { InitiateResult, PaymentProviderStrategy } from './payment-provider.interface';

/**
 * EasyPaisa and JazzCash both expose real server-to-server merchant APIs
 * (JazzCash: HMAC-SHA256-signed form POST; EasyPaisa: their own signed
 * request format) — but both require a live merchant account and sandbox
 * credentials to integrate correctly, which weren't available to verify
 * against here. Rather than ship unverified signature-generation code that
 * *looks* real but would silently fail against the actual gateway, this
 * implements the honest interim: generate a reference number, show the
 * client payment instructions, and let staff confirm receipt manually
 * (`POST /payments/:id/confirm`, already wired in PaymentsService).
 *
 * Bank transfer is manual by nature everywhere, so it uses the same path.
 *
 * Swapping in the real signed API call later only touches `initiate()`
 * here — the rest of the payment lifecycle (Payment rows, milestone/
 * project status transitions, invoices, notifications) doesn't change.
 */
@Injectable()
export class ManualReferenceProvider implements PaymentProviderStrategy {
  constructor(private readonly config: ConfigService) {}

  async initiate(input: { amount: number; currency: string; paymentId: string; description: string }): Promise<InitiateResult> {
    const reference = `TSK-${randomInt(100000, 999999)}`;
    return {
      providerRef: reference,
      instructions: this.buildInstructions(input.amount, input.currency, reference),
    };
  }

  async refund(): Promise<{ providerRefundRef: string }> {
    // No programmatic refund API wired up — staff process these manually
    // (bank transfer back, or an EasyPaisa/JazzCash reversal) and record it
    // via the same refund-review flow once completed.
    return { providerRefundRef: `manual-${Date.now()}` };
  }

  private buildInstructions(amount: number, currency: string, reference: string): string {
    const easypaisaAccount = this.config.get<string>('easypaisa.accountNumber');
    return (
      `Pay ${currency} ${amount.toFixed(2)} and reference ${reference} in the transaction note. ` +
      (easypaisaAccount ? `Send to account ${easypaisaAccount}. ` : '') +
      'Your project team will confirm receipt once the payment is verified.'
    );
  }
}
