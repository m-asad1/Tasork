import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { InitiateResult, PaymentProviderStrategy } from './payment-provider.interface';

/**
 * Talks to PayPal's REST API directly (no SDK dependency — PayPal's own
 * checkout-server-sdk is in maintenance mode; the v2 REST API is what they
 * now recommend). Sandbox vs live is controlled by `paypal.mode`.
 */
@Injectable()
export class PayPalProvider implements PaymentProviderStrategy {
  private readonly logger = new Logger(PayPalProvider.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('paypal.mode') === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get<string>('paypal.clientId');
    const clientSecret = this.config.get<string>('paypal.clientSecret');
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!response.ok) {
      throw new Error(`PayPal OAuth token request failed: ${response.status}`);
    }
    const data = await response.json();
    return data.access_token;
  }

  async initiate(input: { amount: number; currency: string; paymentId: string; description: string }): Promise<InitiateResult> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.paymentId,
            description: input.description,
            amount: { currency_code: input.currency.toUpperCase(), value: input.amount.toFixed(2) },
          },
        ],
        application_context: {
          return_url: `${this.config.get<string>('appUrl')}/dashboard/payments/paypal/return?paymentId=${input.paymentId}`,
          cancel_url: `${this.config.get<string>('appUrl')}/dashboard/payments/paypal/cancel`,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`PayPal order creation failed: ${response.status} ${body}`);
      throw new Error('Failed to create PayPal order');
    }

    const order = await response.json();
    const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href;

    return { providerRef: order.id, redirectUrl: approveLink };
  }

  async capture(orderId: string) {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`PayPal capture failed: ${response.status}`);
    }
    return response.json();
  }

  async refund(input: { providerRef: string; amount: number; currency: string }) {
    const token = await this.getAccessToken();
    // providerRef here is expected to be the capture ID, resolved by the
    // caller from the order at capture time (see PaymentsService).
    const response = await fetch(`${this.baseUrl}/v2/payments/captures/${input.providerRef}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: { value: input.amount.toFixed(2), currency_code: input.currency.toUpperCase() } }),
    });
    if (!response.ok) {
      throw new Error(`PayPal refund failed: ${response.status}`);
    }
    const refund = await response.json();
    return { providerRefundRef: refund.id };
  }
}
