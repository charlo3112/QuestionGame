import { MAX_MESSAGE_LENGTH } from '@common/constants';
import { Message } from '@common/message.interface';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    private roomMessages: Map<string, Message[]> = new Map();

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage('send_message')
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

            this.server.to(roomId).emit('receive_message', messageToSend);
            this.logger.log(`Message sent in room ${roomId} by ${name}`);
        }
    }
    @SubscribeMessage('join_room')
    handleJoinRoom(client: Socket, roomId: string): void {
        client.join(roomId);
        this.logger.log(`Client ${client.id} joined room ${roomId}`);
    }

    @SubscribeMessage('get_messages')
    handleGetMessages(client: Socket, roomId: string): void {
        if (!client.rooms.has(roomId)) {
            return;
        }
        const messages = this.roomMessages.get(roomId) || [];
        client.emit('receive_messages', messages);
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(client: Socket, roomId: string): void {
        client.leave(roomId);
        const room = this.server.sockets.adapter.rooms.get(roomId);
        if (room && room.size === 0) {
            this.server.sockets.adapter.rooms.delete(roomId);
            this.roomMessages.delete(roomId);
        }
        this.logger.log(`Client ${client.id} left room ${roomId}`);
    }

    afterInit(): void {
        this.logger.log('WebSocket server initialized!');
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
