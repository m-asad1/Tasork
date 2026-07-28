import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmManualPaymentDto {
  @ApiProperty({ description: 'Provider transaction/reference number to record against the payment' })
  @IsString()
  providerRef!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
