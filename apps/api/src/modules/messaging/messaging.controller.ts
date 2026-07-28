import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';

import { SendMessageDto } from './dto/send-message.dto';
import { MessagingService } from './messaging.service';

@ApiTags('messaging')
@Controller('projects/:projectId/messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  @ApiOperation({ summary: 'List messages for a project conversation' })
  list(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagingService.listMessages(projectId, user, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search messages within a project conversation' })
  search(@Param('projectId') projectId: string, @CurrentUser() user: User, @Query('q') query: string) {
    return this.messagingService.searchMessages(projectId, user, query ?? '');
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get the unread message count for the current user in this conversation' })
  unreadCount(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.messagingService.getUnreadCount(projectId, user);
  }

  @Post()
  @ApiOperation({ summary: 'Send a message (with optional file attachments)' })
  send(@Param('projectId') projectId: string, @CurrentUser() user: User, @Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(projectId, user, dto.body, dto.fileAssetIds);
  }

  @Post('read')
  @ApiOperation({ summary: 'Mark the conversation as read up to now' })
  markRead(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.messagingService.markRead(projectId, user);
  }
}
