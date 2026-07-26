import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewRequestDto {
  @ApiProperty({ description: 'true to approve (move to APPROVED, ready for a proposal), false to decline' })
  @IsBoolean()
  approve!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  declineReason?: string;
}
