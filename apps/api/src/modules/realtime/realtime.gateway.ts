import { Logger, UseGuards } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { WsJwtGuard } from '@/modules/auth/guards/ws-jwt.guard';

/**
 * Backs the messaging system (docs/24_Messaging.md) and live in-app
 * notifications (docs/25_Notifications.md). Clients join a room per
 * project (`project:{id}`) after authenticating.
 */
@WebSocketGateway({
  cors: { origin: process.env.APP_URL ?? '*', credentials: true },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('project:join')
  handleJoinProject(client: Socket, payload: { projectId: string }) {
    client.join(`project:${payload.projectId}`);
    return { event: 'project:joined', data: { projectId: payload.projectId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  handleMessageSend(client: Socket, payload: { projectId: string; body: string }) {
    // Persisting the message is handled by MessagingService; the gateway only
    // fans it out in real time once persistence succeeds (wired when the
    // messaging module lands — see docs/24_Messaging.md).
    this.server.to(`project:${payload.projectId}`).emit('message:new', {
      projectId: payload.projectId,
      body: payload.body,
      senderId: client.data.userId,
      createdAt: new Date().toISOString(),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:start')
  handleTypingStart(client: Socket, payload: { projectId: string }) {
    client.to(`project:${payload.projectId}`).emit('typing:update', {
      userId: client.data.userId,
      isTyping: true,
    });
  }
}
