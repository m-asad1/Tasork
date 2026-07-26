import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddAttachmentDto {
  @ApiProperty()
  @IsString()
  fileAssetId!: string;
}
