import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class MilestoneItemDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  order!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
