import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export interface ChannelToggles {
  IN_APP: boolean;
  EMAIL: boolean;
  PUSH: boolean;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({
    description: 'Per-notification-type channel toggles. Unknown keys are ignored; missing keys keep their previous value.',
    example: { PROPOSAL_SENT: { IN_APP: true, EMAIL: true, PUSH: false } },
  })
  @IsObject()
  preferences!: Record<string, Partial<ChannelToggles>>;
}
