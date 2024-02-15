import { MAX_MESSAGE_LENGTH } from '@common/constants';
import { Message } from '@common/message.interface';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

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
            this.server.to(roomId).emit('receive_message', messageToSend);
            this.logger.log(`Message sent in room ${roomId} by ${name}`);
        }
    }
    @SubscribeMessage('join_room')
    handleJoinRoom(client: Socket, roomId: string): void {
        client.join(roomId);
        this.logger.log(`Client ${client.id} joined room ${roomId}`);
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(client: Socket, roomId: string): void {
        client.leave(roomId);
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
