import { ApiProperty } from '@nestjs/swagger';
import { DisputeStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class ResolveDisputeDto {
  @ApiProperty({ enum: [DisputeStatus.RESOLVED, DisputeStatus.REJECTED] })
  @IsEnum(DisputeStatus)
  status!: DisputeStatus.RESOLVED | DisputeStatus.REJECTED;

  @ApiProperty()
  @IsString()
  resolutionNote!: string;
}
