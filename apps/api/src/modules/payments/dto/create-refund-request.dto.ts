import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRefundRequestDto {
  @ApiProperty({ required: false, description: 'Omit to request a full refund' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiProperty()
  @IsString()
  reason!: string;
}
