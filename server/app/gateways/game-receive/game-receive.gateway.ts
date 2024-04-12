import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { SetChatPayload } from '@common/interfaces/set-chat-payload';
import { User } from '@common/interfaces/user';
import { Logger } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGatewayReceive implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly roomService: RoomManagementService,
        private readonly gamesService: GameService,
        private readonly logger: Logger,
    ) {}

    @SubscribeMessage('game:create')
    async handleCreateGame(client: Socket, id: string): Promise<User> {
        const game = await this.gamesService.getGameById(id);
        if (!game || !game.visibility) {
            return null;
        }
        const user = await this.roomService.createGame(client.id, game);
        client.join(user.roomId);
        this.logger.log(`User ${user.name} created room ${user.roomId}`);

        return user;
    }

    @SubscribeMessage('game:create-random')
    async handleCreateGameRandom(client: Socket): Promise<User> {
        const user = await this.roomService.createRandomGame(client.id);
        if (!user.ok) {
            return undefined;
        }
        client.join(user.value.roomId);
        this.logger.log(`User ${user.value.name} created random room ${user.value.roomId}`);

        return user.value;
    }

    @SubscribeMessage('game:test')
    async handleTestGame(client: Socket, id: string) {
        const game = await this.gamesService.getGameById(id);
        if (!game || !game.visibility) {
            return null;
        }
        const user = await this.roomService.testGame(client.id, game);
        client.join(user.roomId);
        return user;
    }

    @SubscribeMessage('game:start-test')
    handleStartTest(client: Socket) {
        const activeGame = this.roomService.getActiveGame(client.id);
        activeGame.launchGame();
    }

    @SubscribeMessage('game:leave')
    handleLeaveGame(client: Socket) {
        this.roomService.performUserRemoval(client.id);
    }

    @SubscribeMessage('game:choice')
    handleChoice(client: Socket, choice: boolean[]) {
        this.roomService.handleChoice(client.id, choice);
    }

    @SubscribeMessage('game:qrl-answers')
    handleAnswers(client: Socket, answers: QrlAnswer[]) {
        this.roomService.handleAnswers(client.id, answers);
    }

    @SubscribeMessage('game:qrl-answer')
    handleQrlAnswer(client: Socket, answer: QrlAnswer) {
        this.roomService.handleQrlAnswer(client.id, answer);
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

    @SubscribeMessage('game:getQrlAnswers')
    getQrlAnswers(client: Socket): QrlAnswer[] {
        return this.roomService.getQrlAnswers(client.id);
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

    @SubscribeMessage('game:set-chat')
    setChat(client: Socket, payload: SetChatPayload) {
        this.roomService.setChat(client.id, payload.username, payload.value);
    }

    @SubscribeMessage('game:pause')
    togglePause(client: Socket) {
        this.roomService.togglePause(client.id);
    }

    @SubscribeMessage('game:panic')
    startPanicking(client: Socket) {
        this.roomService.startPanicking(client.id);
    }

    handleDisconnect(client: Socket): void {
        this.roomService.leaveUser(client.id);
    }
}
