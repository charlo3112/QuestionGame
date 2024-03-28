// src/game/game.gateway.ts
import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { User } from '@common/interfaces/user';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Logger } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly roomService: RoomManagementService,
        private readonly gamesService: GameService,
        private readonly logger: Logger,
    ) {}

    @SubscribeMessage('game:create')
    async handleCreateGame(client: Socket, id: string): Promise<User> {
        const game = await this.gamesService.getGameById(id);
        if (!game) {
            return null;
        }
        const user = await this.roomService.createGame(client.id, game);
        client.join(user.roomId);
        this.logger.log(`User ${user.name} created room ${user.roomId}`);

        return user;
    }

    @SubscribeMessage('game:test')
    async handleTestGame(client: Socket, id: string) {
        const game = await this.gamesService.getGameById(id);
        if (!game) {
            return null;
        }
        const user = await this.roomService.testGame(client.id, game);
        client.join(user.roomId);
        const activeGame = this.roomService.getActiveGame(client.id);
        activeGame.testGame();
        return user;
    }

    @SubscribeMessage('game:leave')
    handleLeaveGame(client: Socket) {
        this.roomService.performUserRemoval(client.id);
    }

    @SubscribeMessage('game:choice')
    handleChoice(client: Socket, choice: boolean[]) {
        this.roomService.handleChoice(client.id, choice);
    }

    @SubscribeMessage('game:validate')
    handleValidate(client: Socket) {
        this.roomService.validateChoice(client.id);
    }

    @SubscribeMessage('game:toggle')
    handleToggleGame(client: Socket, closed: boolean) {
        this.roomService.toggleGameClosed(client.id, closed);
    }

    @SubscribeMessage('game:score')
    handleScore(client: Socket): Score {
        return this.roomService.getScore(client.id);
    }

    @SubscribeMessage('game:join')
    async handleJoinGame(client: Socket, payload: PayloadJoinGame): Promise<Result<GameStatePayload>> {
        const res = this.roomService.joinRoom(client.id, payload.gameCode, payload.username);
        if (res.ok) {
            client.join(payload.gameCode);
        }
        return res;
    }

    @SubscribeMessage('game:isValidate')
    isValidate(client: Socket): boolean {
        return this.roomService.isValidate(client.id);
    }

    @SubscribeMessage('game:getChoice')
    getChoice(client: Socket): boolean[] {
        return this.roomService.getChoice(client.id);
    }

    @SubscribeMessage('game:rejoin')
    async handleRejoinGame(client: Socket, user: User): Promise<Result<GameStatePayload>> {
        const res = this.roomService.rejoinRoom(user, client.id);
        if (res.ok) {
            client.join(user.roomId);
        }
        return res;
    }

    @SubscribeMessage('game:confirm')
    async launchGame(client: Socket) {
        await this.roomService.confirmAction(client.id);
    }

    @SubscribeMessage('game:ban')
    banUser(client: Socket, username: string) {
        this.roomService.banUser(client.id, username);
    }

    @SubscribeMessage('game:users')
    getUsers(client: Socket): string[] {
        return this.roomService.getUsers(client.id);
    }

    @SubscribeMessage('game:results')
    showResults(client: Socket) {
        this.roomService.showFinalResults(client.id);
    }

    handleDisconnect(client: Socket): void {
        this.roomService.leaveUser(client.id);
    }

    updateQuestionsCounter(roomId: string, questionsCounter: number[]) {
        this.server.to(roomId).emit('game:questionsCounter', questionsCounter);
    }

    sendTimeUpdate(roomId: string, time: number): void {
        this.server.to(roomId).emit('game:time', time);
    }

    sendDeleteRoom(roomId: string): void {
        this.server.to(roomId).emit('game:closed', 'La partie a été fermée');
        this.server.socketsLeave(roomId);
    }

    sendUserRemoval(userId: string, message: string): void {
        this.server.to(userId).emit('game:closed', message);
    }

    sendUpdateUser(roomId: string, userUpdate: UserConnectionUpdate): void {
        this.server.to(roomId).emit('game:user-update', userUpdate);
    }

    sendStateUpdate(roomId: string, state: GameStatePayload): void {
        this.server.to(roomId).emit('game:state', state);
    }

    sendScoreUpdate(userId: string, score: Score): void {
        this.server.to(userId).emit('game:score', score);
    }

    sendUsersStatUpdate(userId: string, usersStat: UserStat[]): void {
        this.server.to(userId).emit('game:users-stat', usersStat);
    }

    sendHistogramDataUpdate(roomId: string, histogramData: HistogramData): void {
        this.server.to(roomId).emit('game:histogramData', histogramData);
    }
}
