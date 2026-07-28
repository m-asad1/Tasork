import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class TestimonialDto {
  @ApiProperty()
  @IsString()
  authorName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorRole?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  quote!: string;

  @ApiProperty({ required: false, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
