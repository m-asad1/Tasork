import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import type { InitiateResult, PaymentProviderStrategy } from './payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProviderStrategy {
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(this.config.get<string>('stripe.secretKey')!);
  }

  async initiate(input: { amount: number; currency: string; paymentId: string; description: string }): Promise<InitiateResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100), // Stripe uses the smallest currency unit
      currency: input.currency.toLowerCase(),
      description: input.description,
      metadata: { paymentId: input.paymentId },
      automatic_payment_methods: { enabled: true },
    });

    return { providerRef: intent.id, clientSecret: intent.client_secret ?? undefined };
  }

  async refund(input: { providerRef: string; amount: number; currency: string }) {
    const refund = await this.stripe.refunds.create({
      payment_intent: input.providerRef,
      amount: Math.round(input.amount * 100),
    });
    return { providerRefundRef: refund.id };
  }

  /** Used by the webhook controller to verify the signature before trusting the payload. */
  constructEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.config.get<string>('stripe.webhookSecret')!);
  }
}
