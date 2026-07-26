import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import type { Request } from 'express';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Public } from '@/modules/auth/decorators/public.decorator';

import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('users')
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user profile, including completion percentage' })
  async getProfile(@CurrentUser() user: User) {
    return { ...this.usersService.toPublic(user), completion: this.usersService.getProfileCompletion(user) };
  }

  @Post()
  @ApiOperation({ summary: 'Update profile fields' })
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new avatar image' })
  uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: MulterFile) {
    return this.usersService.uploadAvatar(user, file);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password while logged in' })
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user, dto.currentPassword, dto.newPassword);
  }

  @Post('change-email')
  @ApiOperation({ summary: 'Request an email change — sends a confirmation link to the new address' })
  requestEmailChange(@CurrentUser() user: User, @Body() dto: RequestEmailChangeDto) {
    return this.usersService.requestEmailChange(user, dto.newEmail, dto.password);
  }

  @Public()
  @Post('confirm-email-change')
  @ApiOperation({ summary: 'Confirm a pending email change with the token from the confirmation email' })
  confirmEmailChange(@Body() dto: ConfirmEmailChangeDto) {
    return this.usersService.confirmEmailChange(dto.token);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete (soft-delete) the current account' })
  deleteAccount(@CurrentUser() user: User, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(user, dto.password);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions (devices currently logged in)' })
  listSessions(@CurrentUser() user: User, @Req() req: Request) {
    return this.usersService.listActiveSessions(user.id, req.cookies?.['tasork_refresh']);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Revoke a specific session/device' })
  revokeSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.revokeSession(user.id, id);
  }

  @Get('login-history')
  @ApiOperation({ summary: 'List recent login attempts (success and failure)' })
  loginHistory(@CurrentUser() user: User) {
    return this.usersService.listLoginHistory(user.id);
  }
}
