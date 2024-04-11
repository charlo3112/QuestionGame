import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { WebsocketMessage } from '@common/enums/websocket-message';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
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

    @SubscribeMessage(WebsocketMessage.CreateGame)
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

    @SubscribeMessage(WebsocketMessage.CreateGameRandom)
    async handleCreateGameRandom(client: Socket): Promise<User> {
        const user = await this.roomService.createRandomGame(client.id);
        if (!user.ok) {
            return undefined;
        }
        client.join(user.value.roomId);
        this.logger.log(`User ${user.value.name} created random room ${user.value.roomId}`);

        return user.value;
    }

    @SubscribeMessage(WebsocketMessage.CreateTest)
    async handleTestGame(client: Socket, id: string) {
        const game = await this.gamesService.getGameById(id);
        if (!game || !game.visibility) {
            return null;
        }
        const user = await this.roomService.testGame(client.id, game);
        client.join(user.roomId);
        return user;
    }

    @SubscribeMessage(WebsocketMessage.StartTest)
    handleStartTest(client: Socket) {
        const activeGame = this.roomService.getActiveGame(client.id);
        activeGame.launchGame();
    }

    @SubscribeMessage(WebsocketMessage.LeaveGame)
    handleLeaveGame(client: Socket) {
        this.roomService.performUserRemoval(client.id);
    }

    @SubscribeMessage(WebsocketMessage.SetChat)
    handleChoice(client: Socket, choice: boolean[]) {
        this.roomService.handleChoice(client.id, choice);
    }

    @SubscribeMessage(WebsocketMessage.ValidateChoice)
    handleValidate(client: Socket) {
        this.roomService.validateChoice(client.id);
    }

    @SubscribeMessage(WebsocketMessage.ToggleGame)
    handleToggleGame(client: Socket, closed: boolean) {
        this.roomService.toggleGameClosed(client.id, closed);
    }

    @SubscribeMessage(WebsocketMessage.Score)
    handleScore(client: Socket): Score {
        return this.roomService.getScore(client.id);
    }

    @SubscribeMessage(WebsocketMessage.JoinGame)
    async handleJoinGame(client: Socket, payload: PayloadJoinGame): Promise<Result<GameStatePayload>> {
        const res = this.roomService.joinRoom(client.id, payload.gameCode, payload.username);
        if (res.ok) {
            client.join(payload.gameCode);
        }
        return res;
    }

    @SubscribeMessage(WebsocketMessage.IsValidate)
    isValidate(client: Socket): boolean {
        return this.roomService.isValidate(client.id);
    }

    @SubscribeMessage(WebsocketMessage.GetChoice)
    getChoice(client: Socket): boolean[] {
        return this.roomService.getChoice(client.id);
    }

    @SubscribeMessage(WebsocketMessage.Rejoin)
    async handleRejoinGame(client: Socket, user: User): Promise<Result<GameStatePayload>> {
        const res = this.roomService.rejoinRoom(user, client.id);
        if (res.ok) {
            client.join(user.roomId);
        }
        return res;
    }

    @SubscribeMessage(WebsocketMessage.Confirm)
    async launchGame(client: Socket) {
        await this.roomService.confirmAction(client.id);
    }

    @SubscribeMessage(WebsocketMessage.Ban)
    banUser(client: Socket, username: string) {
        this.roomService.banUser(client.id, username);
    }

    @SubscribeMessage(WebsocketMessage.Users)
    getUsers(client: Socket): string[] {
        return this.roomService.getUsers(client.id);
    }

    @SubscribeMessage(WebsocketMessage.Results)
    showResults(client: Socket) {
        this.roomService.showFinalResults(client.id);
    }

    @SubscribeMessage(WebsocketMessage.SetChat)
    setChat(client: Socket, payload: SetChatPayload) {
        this.roomService.setChat(client.id, payload.username, payload.value);
    }

    @SubscribeMessage(WebsocketMessage.Pause)
    togglePause(client: Socket) {
        this.roomService.togglePause(client.id);
    }

    @SubscribeMessage(WebsocketMessage.Panic)
    startPanicking(client: Socket) {
        this.roomService.startPanicking(client.id);
    }

    handleDisconnect(client: Socket): void {
        this.roomService.leaveUser(client.id);
    }
}
