// src/game/game.gateway.ts
import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-managment/room-management.service';
import { GameState } from '@common/game-state';
import { PayloadJoinGame } from '@common/payload-game.interface';
import { Result } from '@common/result';
import { User } from '@common/user.interface';
import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
    @WebSocketServer() server: Server;

    constructor(
        private roomService: RoomManagementService,
        private readonly gamesService: GameService,
        private readonly logger: Logger,
    ) {}

    @SubscribeMessage('game:create')
    async handleCreateGame(client: Socket, id: string): Promise<User> {
        const game = await this.gamesService.getGameById(id);
        this.logger.log(`User ${client.id} created room`);
        if (!game) {
            return null;
        }
        const user = this.roomService.createGame(client.id, game);
        client.join(user.roomId);
        this.logger.log(`User ${user.name} created room ${user.roomId}`);

        return user;
    }

    @SubscribeMessage('game:leave')
    handleLeaveGame(client: Socket) {
        const roomId = this.roomService.performUserRemoval(client.id);
        client.leave(roomId);
    }

    @SubscribeMessage('game:toggle')
    handleToggleGame(client: Socket, closed: boolean) {
        this.roomService.toggleGameClosed(client.id, closed);
    }

    @SubscribeMessage('game:join')
    async handleJoinGame(client: Socket, payload: PayloadJoinGame): Promise<Result<GameState>> {
        const res = this.roomService.joinRoom(client.id, payload.gameCode, payload.username);
        if (res.ok) {
            client.join(payload.gameCode);
        }
        return res;
    }

    @SubscribeMessage('game:rejoin')
    async handleRejoinGame(client: Socket, user: User): Promise<Result<GameState>> {
        const res = this.roomService.rejoinRoom(user, client.id);
        if (res.ok) {
            client.join(user.roomId);
        }
        return res;
    }

    @SubscribeMessage('game:launch')
    launchGame(client: Socket) {
        const res = this.roomService.launchGame(client.id);
        if (res) {
            const roomId = this.roomService.getRoomId(client.id);
            this.server.to(roomId).emit('game:state', res);
        }
    }

    @SubscribeMessage('game:ban')
    banUser(client: Socket, username: string) {
        const userId = this.roomService.banUser(client.id, username);
        if (userId) {
            const roomId = this.roomService.getRoomId(client.id);
            this.server.in(roomId).socketsLeave(userId);
        }
    }

    @SubscribeMessage('game:users')
    getUsers(client: Socket): string[] {
        return this.roomService.getUsers(client.id);
    }

    handleDisconnect(client: Socket): void {
        this.roomService.leaveUser(client.id);
    }
}
