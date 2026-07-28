import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateSectionDto {
  @ApiProperty({ description: 'Arbitrary JSON content — shape depends on the section key' })
  @IsObject()
  content!: Record<string, unknown>;
}
