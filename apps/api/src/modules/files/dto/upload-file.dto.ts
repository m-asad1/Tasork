import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FileVisibility } from '@prisma/client';

export class UploadFileDto {
  @ApiProperty({ enum: FileVisibility, required: false })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;

  /** If set, this upload becomes a new version of an existing FileAsset. */
  @ApiProperty({ required: false })
  @IsOptional()
  rootId?: string;
}
