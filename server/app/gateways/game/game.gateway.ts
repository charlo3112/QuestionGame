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
        private roomService: RoomManagementService,
        private readonly gamesService: GameService,
        private readonly logger: Logger,
    ) {
        this.roomService.setGatewayCallback(this.handleDeleteRoom.bind(this));
        this.roomService.setDisconnectUser(this.handleUserRemoval.bind(this));
        this.roomService.setUpdateUser(this.handleUpdateUser.bind(this));
    }

    @SubscribeMessage('game:create')
    async handleCreateGame(client: Socket, id: string): Promise<User> {
        const game = await this.gamesService.getGameById(id);
        if (!game) {
            return null;
        }
        const user = this.roomService.createGame(
            client.id,
            game,
            this.handleStateUpdate.bind(this),
            this.handleTimeUpdate.bind(this),
            this.handleScoreUpdate.bind(this),
            this.handleUsersStatUpdate.bind(this),
            this.handleHistogramDataUpdate.bind(this),
        );
        client.join(user.roomId);
        this.logger.log(`User ${user.name} created room ${user.roomId}`);

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

    @SubscribeMessage('game:launch')
    async launchGame(client: Socket) {
        await this.roomService.launchGame(client.id);
    }

    @SubscribeMessage('game:ban')
    banUser(client: Socket, username: string) {
        this.roomService.banUser(client.id, username);
    }

    @SubscribeMessage('game:users')
    getUsers(client: Socket): string[] {
        return this.roomService.getUsers(client.id);
    }

    @SubscribeMessage('game:next')
    nextQuestion(client: Socket) {
        this.roomService.nextQuestion(client.id);
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

    private handleDeleteRoom(roomId: string): void {
        this.server.to(roomId).emit('game:closed', 'La partie a été fermée');
        this.server.socketsLeave(roomId);
    }

    private handleUserRemoval(userId: string, message: string): void {
        this.server.to(userId).emit('game:closed', message);
    }

    private handleUpdateUser(roomId: string, userUpdate: UserConnectionUpdate): void {
        this.server.to(roomId).emit('game:user-update', userUpdate);
    }

    private handleStateUpdate(roomId: string, state: GameStatePayload): void {
        this.server.to(roomId).emit('game:state', state);
    }

    private handleTimeUpdate(roomId: string, time: number): void {
        this.server.to(roomId).emit('game:time', time);
    }

    private handleScoreUpdate(userId: string, score: Score): void {
        this.server.to(userId).emit('game:score', score);
    }

    private handleUsersStatUpdate(userId: string, usersStat: UserStat[]): void {
        this.server.to(userId).emit('game:users-stat', usersStat);
    }

    private handleHistogramDataUpdate(roomId: string, histogramData: HistogramData): void {
        this.server.to(roomId).emit('game:histogramData', histogramData);
    }
}
