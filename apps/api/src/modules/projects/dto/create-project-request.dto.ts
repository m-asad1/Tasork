import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class CreateProjectRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  @MinLength(30)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  budgetRange?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsISO8601()
  deadline?: string;

  /**
   * Sent by the submission form for confirmation display purposes; the
   * account's verified email (not this field) is the source of truth for
   * where updates are actually sent.
   */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  /** File asset IDs previously uploaded via POST /files/upload. */
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  fileAssetIds?: string[];
}
