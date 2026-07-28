import { Module } from '@nestjs/common';

import { FilesModule } from '@/modules/files/files.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { RealtimeModule } from '@/modules/realtime/realtime.module';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ManualReferenceProvider } from './providers/manual-reference.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { StripeProvider } from './providers/stripe.provider';

@Module({
  imports: [FilesModule, NotificationsModule, RealtimeModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeProvider, PayPalProvider, ManualReferenceProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
