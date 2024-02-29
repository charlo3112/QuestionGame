// src/game/game.gateway.ts
import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-managment/room-management.service';
import { GameState } from '@common/game-state';
import { PayloadJoinGame } from '@common/payload-game.interface';
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
    async handleCreateGame(client: Socket, id: string) {
        const game = await this.gamesService.getGameById(id);
        if (!game) {
            return;
        }
        const room = this.roomService.createGame(client.id, game);
        client.join(room);
    }

    @SubscribeMessage('game:leave')
    handleLeaveGame(client: Socket) {
        const roomId = this.roomService.leaveUser(client.id);
        client.leave(roomId);
    }

    @SubscribeMessage('game:toggle')
    handleToggleGame(client: Socket, closed: boolean) {
        this.roomService.toggleGameClosed(client.id, closed);
    }

    @SubscribeMessage('game:join')
    handleJoinGame(client: Socket, payload: PayloadJoinGame) {
        const res = this.roomService.joinRoom(client.id, payload.gameCode, payload.username);
        if (res === GameState.Wait) {
            const roomId = this.roomService.getRoomId(client.id);
            client.join(roomId);
        }
        client.emit('game:state', res);
    }

    @SubscribeMessage('game:launch')
    launchGame(client: Socket) {
        const res = this.roomService.launchGame(client.id);
        if (res) {
            const roomId = this.roomService.getRoomId(client.id);
            this.server.to(roomId).emit('game:state', res);
        }
    }

    handleDisconnect(client: Socket): void {
        this.roomService.leaveUser(client.id);
    }
}
