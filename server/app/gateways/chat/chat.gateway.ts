import { RoomManagementService } from '@app/services/room-management.service';
import { MAX_MESSAGE_LENGTH } from '@common/constants';
import { Message } from '@common/message.interface';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    private roomMessages: Map<string, Message[]> = new Map();

    constructor(
        private readonly logger: Logger,
        private readonly roomManager: RoomManagementService,
    ) {
        // this.roomManager.setGatewayCallback(this.handleJoinRoom.bind(this), this.handleLeaveRoom.bind(this));
    }

    @SubscribeMessage('message:send')
    handleMessage(client: Socket, payload: { roomId: string; message: string; name: string }): void {
        const { roomId, message, name } = payload;
        const trimmedMessage = message.substring(0, MAX_MESSAGE_LENGTH);
        const timestamp = new Date().toLocaleTimeString();

        const messageToSend: Message = {
            name,
            message: trimmedMessage,
            timestamp,
        };

        if (client.rooms.has(roomId)) {
            if (!this.roomMessages.has(roomId)) {
                this.roomMessages.set(roomId, []);
            }
            this.roomMessages.get(roomId)?.push(messageToSend);

            this.server.to(roomId).emit('message:receive', messageToSend);
            this.logger.debug(`${trimmedMessage} sent in room ${roomId} by ${name}`);
        }
    }

    @SubscribeMessage('messages:get')
    handleGetMessages(client: Socket, roomId: string): void {
        if (!client.rooms.has(roomId)) {
            return;
        }
        const messages = this.roomMessages.get(roomId) || [];
        client.emit('messages:list', messages);
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket): void {
        const rooms = this.server.sockets.adapter.rooms;
        this.roomMessages.forEach((value, key) => {
            if (!rooms.has(key)) {
                this.roomMessages.delete(key);
            }
        });
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
