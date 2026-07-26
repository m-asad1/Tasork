import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
 * Transport layer for real-time features: project-scoped messaging
 * (docs/24_Messaging.md) and live in-app notifications
 * (docs/25_Notifications.md). Message *persistence* happens over REST in
 * MessagingService, which then calls emitToConversation()/emitToUser() here
 * to fan the result out — keeps this gateway a thin transport, not a second
 * source of truth for message state.
 *
 * Every authenticated connection auto-joins a `user:{id}` room so any
 * service in the app can push to a specific user without knowing their
 * socket id.
 */
@WebSocketGateway({
  cors: { origin: process.env.APP_URL ?? '*', credentials: true },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers.authorization?.startsWith('Bearer ')
        ? client.handshake.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      this.logger.debug(`Unauthenticated socket connected: ${client.id}`);
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${client.id} (user ${payload.sub})`);
    } catch {
      this.logger.debug(`Socket ${client.id} presented an invalid token`);
    }
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
  @SubscribeMessage('project:leave')
  handleLeaveProject(client: Socket, payload: { projectId: string }) {
    client.leave(`project:${payload.projectId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:start')
  handleTypingStart(client: Socket, payload: { projectId: string }) {
    client.to(`project:${payload.projectId}`).emit('typing:update', {
      userId: client.data.userId,
      isTyping: true,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:stop')
  handleTypingStop(client: Socket, payload: { projectId: string }) {
    client.to(`project:${payload.projectId}`).emit('typing:update', {
      userId: client.data.userId,
      isTyping: false,
    });
  }

  // ------------------------------------------------------------------
  // Server-initiated fan-out — called by other services, not by clients.
  // ------------------------------------------------------------------

  emitToProject(projectId: string, event: string, payload: unknown) {
    this.server.to(`project:${projectId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
