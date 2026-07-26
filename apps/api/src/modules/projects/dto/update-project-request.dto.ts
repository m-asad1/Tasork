import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(30)
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
