import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class FaqItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  question!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  answer!: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
