import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';

import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the notification center' })
  list(
    @CurrentUser() user: User,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.list(user.id, {
      unreadOnly: unreadOnly === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markRead(user.id, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get the current user notification channel preferences' })
  getPreferences(@CurrentUser() user: User) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Update notification channel preferences' })
  updatePreferences(@CurrentUser() user: User, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.notificationsService.updatePreferences(user.id, dto.preferences);
  }
}
