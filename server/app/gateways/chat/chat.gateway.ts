import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { MAX_MESSAGE_LENGTH } from '@common/constants';
import { Message } from '@common/interfaces/message';
import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
    @WebSocketServer() private server: Server;
    private roomMessages: Map<string, Message[]> = new Map();

    constructor(
        private readonly logger: Logger,
        private readonly roomManager: RoomManagementService,
    ) {
        this.roomManager.setGatewayCallback(this.handleDeleteRoom.bind(this));
        this.roomManager.setSystemMessageCallback(this.sendSystemMessage.bind(this));
    }

    @SubscribeMessage('message:send')
    handleMessage(client: Socket, message: string): void {
        const roomId = this.roomManager.getRoomId(client.id);
        const name = this.roomManager.getUsername(client.id);
        if (!this.roomManager.canChat(client.id)) {
            return;
        }

        const trimmedMessage = message.substring(0, MAX_MESSAGE_LENGTH);
        const timestamp = new Date().getTime();
        const messageToSend: Message = {
            name,
            message: trimmedMessage,
            timestamp,
        };

        if (!roomId || !name) {
            return;
        }

        if (!this.roomMessages.has(roomId)) {
            this.roomMessages.set(roomId, []);
        }
        this.roomMessages.get(roomId)?.push(messageToSend);

        this.server.to(roomId).emit('message:receive', messageToSend);
    }

    @SubscribeMessage('messages:get')
    async handleGetMessages(client: Socket): Promise<Message[]> {
        const roomId = this.roomManager.getRoomId(client.id);
        const messages = this.roomMessages.get(roomId) || [];
        return messages;
    }

    private sendSystemMessage(roomId: string, message: string): void {
        const timestamp = new Date().getTime();
        const messageToSend: Message = {
            name: 'System',
            message,
            timestamp,
        };

        if (this.roomMessages.has(roomId)) {
            this.roomMessages.get(roomId)?.push(messageToSend);
        }

        this.server.to(roomId).emit('message:receive', messageToSend);
    }

    private handleDeleteRoom(roomID: string): void {
        this.roomMessages.delete(roomID);
    }
}
