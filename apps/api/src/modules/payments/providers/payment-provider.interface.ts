export interface InitiateResult {
  providerRef: string;
  /** Stripe: client_secret for confirming with Stripe.js on the frontend. */
  clientSecret?: string;
  /** PayPal / redirect-based providers: where the client approves payment. */
  redirectUrl?: string;
  /** EasyPaisa / JazzCash / Bank Transfer: human instructions to display. */
  instructions?: string;
}

export interface PaymentProviderStrategy {
  /** Starts a payment for the given amount (in major currency units, e.g. dollars). */
  initiate(input: { amount: number; currency: string; paymentId: string; description: string }): Promise<InitiateResult>;

  /** Issues a refund for a previously succeeded payment, where the provider supports it programmatically. */
  refund(input: { providerRef: string; amount: number; currency: string }): Promise<{ providerRefundRef: string }>;
}

export const PAYMENT_PROVIDER_STRATEGY = 'PAYMENT_PROVIDER_STRATEGY';
