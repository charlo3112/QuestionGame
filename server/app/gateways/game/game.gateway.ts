// src/game/game.gateway.ts
import { RoomManagementService } from '@app/services/room-management.service';
import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
    @WebSocketServer() server: Server;

    constructor(
        private roomService: RoomManagementService,
        private readonly logger: Logger,
    ) {}

    @SubscribeMessage('join_room')
    handleJoinGame(client: Socket, roomId: string) {
        client.join(roomId);
    }

    @SubscribeMessage('leave_room')
    handleLeaveGame(client: Socket, roomId: string) {
        client.leave(roomId);
        if (!this.server.sockets.adapter.rooms.get(roomId)) {
            this.roomService.removeRoom(roomId);
        }
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
