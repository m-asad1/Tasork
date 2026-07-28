import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(3000)
  description!: string;
}
