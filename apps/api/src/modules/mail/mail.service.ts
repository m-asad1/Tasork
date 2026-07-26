import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('mail.resendApiKey');
    this.from = this.config.get<string>('mail.from')!;

    // The Resend SDK throws synchronously if constructed with an empty key,
    // which would crash the whole app on boot in any environment that hasn't
    // configured email yet (e.g. fresh local dev). Fall back to a "dry run"
    // mode that logs instead of sending, so auth/registration keep working
    // even before RESEND_API_KEY is set.
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set — emails will be logged instead of sent.');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
  }
}

  async send({ to, subject, html }: SendMailOptions) {
    if (!this.resend) {
      this.logger.log(`[dry run] Would send "${subject}" to ${to}`);
      return;
    }

    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (error) {
      // Email delivery failures must never crash the request that triggered them;
      // they're logged and (once the queue module wiring is complete) retried
      // via the EMAIL_QUEUE — see docs/25_Notifications.md.
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
    }
  }

  try {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    this.logger.error(
      `Failed to send email to ${to}: ${(error as Error).message}`
    );
  }
}

  sendVerificationEmail(to: string, verifyUrl: string) {
    return this.send({
      to,
      subject: 'Verify your Tasork account',
      html: `<p>Welcome to Tasork. Confirm your email to activate your account:</p>
             <p><a href="${verifyUrl}">Verify my email</a></p>
             <p>If you didn't create this account, you can ignore this email.</p>`,
    });
  }

  sendPasswordResetEmail(to: string, resetUrl: string) {
    return this.send({
      to,
      subject: 'Reset your Tasork password',
      html: `<p>We received a request to reset your password.</p>
             <p><a href="${resetUrl}">Reset my password</a></p>
             <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    });
  }
}
