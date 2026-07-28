import { ApiProperty } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';
import { IsBoolean, IsEnum, IsISO8601, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type!: CouponType;

  @ApiProperty({ description: 'Percent (0-100) if type is PERCENT, otherwise a fixed currency amount' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
