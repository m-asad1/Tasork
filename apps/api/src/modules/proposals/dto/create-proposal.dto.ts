import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { DeliverableItemDto } from './deliverable-item.dto';
import { MilestoneItemDto } from './milestone-item.dto';

export class CreateProposalDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  timelineDays!: number;

  @ApiProperty()
  @IsString()
  scope!: string;

  @ApiProperty()
  @IsString()
  revisionPolicy!: string;

  @ApiProperty({ required: false, description: 'Defaults to 14 days from send if omitted' })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @ApiProperty({ type: [DeliverableItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DeliverableItemDto)
  deliverables!: DeliverableItemDto[];

  @ApiProperty({ type: [MilestoneItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MilestoneItemDto)
  milestones!: MilestoneItemDto[];
}
