import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewRefundRequestDto {
  @ApiProperty()
  @IsBoolean()
  approve!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolutionNote?: string;
}
