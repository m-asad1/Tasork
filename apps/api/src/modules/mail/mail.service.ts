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
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('mail.resendApiKey'));
    this.from = this.config.get<string>('mail.from')!;
  }

  async send({ to, subject, html }: SendMailOptions) {
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (error) {
      // Email delivery failures must never crash the request that triggered them;
      // they're logged and (once the queue module wiring is complete) retried
      // via the EMAIL_QUEUE — see docs/25_Notifications.md.
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
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
