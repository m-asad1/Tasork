export interface AppConfig {
  nodeEnv: string;
  port: number;
  appUrl: string;
  apiUrl: string;
  database: { url: string };
  redis: { url: string };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  google: { clientId: string; clientSecret: string; callbackUrl: string };
  mail: { resendApiKey: string; from: string };
  storage: {
    endpoint: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  stripe: { secretKey: string; webhookSecret: string };
  paypal: { clientId: string; clientSecret: string; mode: 'sandbox' | 'live' };
  easypaisa: { merchantId: string; storeId: string; accountNumber: string };
  jazzcash: { merchantId: string; password: string; integritySalt: string };
  tax: { ratePercent: number };
  throttle: { ttl: number; limit: number };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  database: { url: process.env.DATABASE_URL ?? '' },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
  },
  mail: {
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    from: process.env.MAIL_FROM ?? 'Tasork <noreply@tasork.com>',
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT ?? '',
    bucket: process.env.S3_BUCKET ?? 'tasork-uploads',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    region: process.env.S3_REGION ?? 'auto',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID ?? '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
    mode: (process.env.PAYPAL_MODE as 'sandbox' | 'live') ?? 'sandbox',
  },
  easypaisa: {
    merchantId: process.env.EASYPAISA_MERCHANT_ID ?? '',
    storeId: process.env.EASYPAISA_STORE_ID ?? '',
    accountNumber: process.env.EASYPAISA_ACCOUNT_NUMBER ?? '',
  },
  jazzcash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID ?? '',
    password: process.env.JAZZCASH_PASSWORD ?? '',
    integritySalt: process.env.JAZZCASH_INTEGRITY_SALT ?? '',
  },
  tax: {
    ratePercent: parseFloat(process.env.TAX_RATE_PERCENT ?? '0'),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
