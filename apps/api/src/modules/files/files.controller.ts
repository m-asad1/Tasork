import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';

import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file (or a new version of an existing file)' })
  upload(@UploadedFile() file: MulterFile, @CurrentUser() user: User, @Body() dto: UploadFileDto) {
    return this.filesService.uploadFile(user, file, {
      visibility: dto?.visibility,
      rootId: dto?.rootId,
    });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get a short-lived signed download URL for a file' })
  getDownloadUrl(@Param('id') id: string, @CurrentUser() user: User) {
    return this.filesService.getDownloadUrl(id, user);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'List all versions of a file' })
  listVersions(@Param('id') id: string, @CurrentUser() user: User) {
    return this.filesService.listVersions(id, user);
  }
}
