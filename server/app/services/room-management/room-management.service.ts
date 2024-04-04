import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { ActiveGame } from '@app/model/classes/active-game/active-game';
import { UserData } from '@app/model/classes/user/user';
import { GameData } from '@app/model/database/game';
import { QuestionData } from '@app/model/database/question';
import { HistoryService } from '@app/services/history/history.service';
import { QuestionService } from '@app/services/question/question.service';
import { HOST_NAME, MAX_ROOM_NUMBER, MIN_ROOM_NUMBER, NUMBER_QUESTIONS_RANDOM, TIMEOUT_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { User } from '@common/interfaces/user';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomManagementService {
    private gameState: Map<string, ActiveGame> = new Map();
    private roomMembers: Map<string, string> = new Map();
    private disconnectionTimers: Map<string, NodeJS.Timeout> = new Map();
    private deleteRoomChatGateway: (roomID: string) => void;
    private sendSystemMessage: (roomId: string, message: string) => void;

    constructor(
        private gameWebsocket: GameGatewaySend,
        private historyService: HistoryService,
        private questionService: QuestionService,
    ) {}

    setGatewayCallback(deleteRoom: (roomID: string) => void) {
        this.deleteRoomChatGateway = deleteRoom;
    }

    setSystemMessageCallback(sendSystemMessage: (roomId: string, message: string) => void) {
        this.sendSystemMessage = sendSystemMessage;
    }

    handleChoice(userId: string, choice: boolean[]): void {
        const game = this.getActiveGame(userId);
        if (!game) {
            return;
        }
        game.handleChoice(userId, choice);
    }

    validateChoice(userId: string): void {
        const game = this.getActiveGame(userId);
        if (!game) {
            return;
        }
        game.validateChoice(userId);
    }

    setChat(hostId: string, username: string, value: boolean): void {
        const game = this.getActiveGame(hostId);
        if (!game) {
            return;
        }
        const uid = game.setChat(hostId, username, value);
        if (uid) {
            this.gameWebsocket.sendAlert(uid, `clavardage ${value ? 'activé' : 'désactivé'}`);
        }
    }

    canChat(userId: string): boolean {
        return this.getActiveGame(userId).canChat(userId);
    }

    async createGame(userId: string, game: GameData): Promise<User> {
        const roomId = this.generateRoomId();
        const host: UserData = new UserData(userId, roomId, HOST_NAME);
        const newActiveGame: ActiveGame = new ActiveGame(game, roomId, this.gameWebsocket, this.historyService);
        newActiveGame.addUser(host);

        if (this.roomMembers.has(userId)) {
            this.performUserRemoval(userId);
        }

        this.gameState.set(roomId, newActiveGame);
        this.roomMembers.set(host.uid, roomId);

        return { name: HOST_NAME, roomId, userId, play: false };
    }

    async createRandomGame(userId: string): Promise<Result<User>> {
        const questions = await this.questionService.getAllQCMQuestions();
        if (questions.length < NUMBER_QUESTIONS_RANDOM) {
            return { ok: false, error: 'Pas assez de questions' };
        }

        const game: GameData = {
            title: 'mode aléatoire',
            questions: this.shuffleAndSliceQuestions(questions, NUMBER_QUESTIONS_RANDOM) as QuestionData[],
            description: 'mode aléatoire',
            duration: 20,
        } as GameData;

        const roomId = this.generateRoomId();
        const host: UserData = new UserData(userId, roomId, HOST_NAME);
        const newActiveGame: ActiveGame = new ActiveGame(game, roomId, this.gameWebsocket, this.historyService, true);
        newActiveGame.addUser(host);

        if (this.roomMembers.has(userId)) {
            this.performUserRemoval(userId);
        }

        this.gameState.set(roomId, newActiveGame);
        this.roomMembers.set(host.uid, roomId);

        return { ok: true, value: { name: HOST_NAME, roomId, userId, play: true } };
    }

    async testGame(userId: string, game: GameData): Promise<User> {
        const roomId = 'test' + this.generateRoomId();
        const host: UserData = new UserData(userId, roomId, HOST_NAME);
        const newActiveGame: ActiveGame = new ActiveGame(game, roomId, this.gameWebsocket, undefined, true);
        newActiveGame.addUser(host);

        if (this.roomMembers.has(userId)) {
            this.performUserRemoval(userId);
        }

        this.gameState.set(roomId, newActiveGame);
        this.roomMembers.set(host.uid, roomId);
        return { name: HOST_NAME, roomId, userId, play: true };
    }

    toggleGameClosed(userId: string, closed: boolean) {
        const game = this.getActiveGame(userId);
        if (!game || !game.isHost(userId) || game.currentState !== GameState.Wait) {
            return;
        }
        game.isLocked = closed;
    }

    isValidate(userId: string): boolean {
        const game = this.getActiveGame(userId);
        if (!game) {
            return false;
        }
        return game.isValidate(userId);
    }

    showFinalResults(userId: string) {
        this.getActiveGame(userId).showFinalResults();
    }

    getChoice(userId: string): boolean[] {
        const game = this.getActiveGame(userId);
        if (!game) {
            return [false, false, false, false];
        }
        return game.getChoice(userId);
    }

    getScore(userId: string): Score {
        const game = this.getActiveGame(userId);
        if (!game) {
            return { score: 0, bonus: false };
        }
        return game.getScore(userId);
    }

    joinRoom(userId: string, roomId: string, username: string): Result<GameStatePayload> {
        username = username.trim();
        const activeGame = this.gameState.get(roomId);
        if (!activeGame) {
            return { ok: false, error: 'Code invalide' };
        }
        if (this.roomMembers.has(userId)) {
            this.performUserRemoval(userId);
        }
        if (activeGame.isLocked) {
            return { ok: false, error: 'La salle est verouillé' };
        }
        if (activeGame.isBanned(username) || activeGame.userExists(username) || username === '') {
            return { ok: false, error: 'Le nom est déjà pris ou banni' };
        }
        const newUser: UserData = new UserData(userId, roomId, username);
        this.roomMembers.set(userId, roomId);
        activeGame.addUser(newUser);
        const userUpdate: UserConnectionUpdate = { isConnected: true, username };
        this.gameWebsocket.sendUpdateUser(roomId, userUpdate);
        return { ok: true, value: activeGame.gameStatePayload };
    }

    rejoinRoom(user: User, newUserId: string): Result<GameStatePayload> {
        const activeGame = this.gameState.get(user.roomId);
        if (!activeGame) {
            return { ok: false, error: 'Code invalide' };
        }
        if (this.disconnectionTimers.has(user.userId)) {
            clearTimeout(this.disconnectionTimers.get(user.userId));
            this.disconnectionTimers.delete(user.userId);
        }
        if (
            !this.roomMembers.has(user.userId) ||
            activeGame.isBanned(user.name) ||
            activeGame.getUser(user.userId).username !== user.name ||
            !activeGame.canRejoin(user.userId)
        ) {
            return { ok: false, error: 'Reconnection impossible' };
        }
        this.roomMembers.delete(user.userId);
        this.roomMembers.set(newUserId, user.roomId);
        activeGame.update(user.userId, newUserId);
        return { ok: true, value: activeGame.gameStatePayload };
    }

    leaveUser(userId: string): void {
        const user = this.getUser(userId);
        if (!user) {
            return;
        }

        const removalTimeout = setTimeout(() => {
            this.performUserRemoval(userId);
        }, TIMEOUT_DURATION);

        this.disconnectionTimers.set(userId, removalTimeout);
    }

    getRoomId(userId: string): string {
        return this.roomMembers.get(userId);
    }

    getUsers(userId: string): string[] {
        const roomId = this.roomMembers.get(userId);
        if (!roomId) {
            return [];
        }
        const game = this.gameState.get(roomId);
        if (!game) {
            return [];
        }
        return game.usersArray;
    }

    getUsername(userId: string): string | undefined {
        const user = this.getUser(userId);
        if (!user) {
            return undefined;
        }
        return user.username;
    }

    performUserRemoval(userId: string): void {
        const game = this.getActiveGame(userId);
        const username = this.getUsername(userId);
        const roomId = this.roomMembers.get(userId);
        this.roomMembers.delete(userId);
        if (!game) {
            return;
        }
        this.gameWebsocket.sendUserRemoval(userId, 'Vous avez été déconnecté');
        if (game.isHost(userId)) {
            this.deleteRoomChatGateway(roomId);
            this.gameWebsocket.sendDeleteRoom(roomId);
            this.gameState.delete(roomId);
            game.stopGame();
            return;
        }
        game.removeUser(userId);
        if (game.needToClosed() && game.currentState !== GameState.Wait) {
            this.deleteRoomChatGateway(roomId);
            this.gameWebsocket.sendDeleteRoom(roomId);
            this.gameState.delete(roomId);
            game.stopGame();
            return;
        }
        const userUpdate: UserConnectionUpdate = { isConnected: false, username };
        this.gameWebsocket.sendUpdateUser(roomId, userUpdate);
        this.sendSystemMessage(roomId, `${username} a quitté la salle`);
    }

    banUser(userId: string, bannedUsername: string): void {
        const game = this.getActiveGame(userId);
        if (!game) {
            return;
        }
        if (!game.isHost(userId)) {
            return;
        }
        const banId = game.banUser(bannedUsername);
        if (banId) {
            this.gameWebsocket.sendUserRemoval(banId, 'Vous avez été banni');
            this.roomMembers.delete(banId);
            const userUpdate: UserConnectionUpdate = { isConnected: false, username: bannedUsername };
            this.gameWebsocket.sendUpdateUser(this.getRoomId(userId), userUpdate);
        }
    }

    getActiveGame(userId: string): ActiveGame {
        const roomId = this.roomMembers.get(userId);
        if (!roomId) {
            return undefined;
        }
        return this.gameState.get(roomId);
    }

    async confirmAction(userId: string) {
        const user = this.getUser(userId);
        if (!user || !user.isHost()) {
            return;
        }
        const game = this.getActiveGame(userId);
        await game.advance();
    }

    private generateRoomId(): string {
        let roomId = (Math.floor(Math.random() * (MAX_ROOM_NUMBER - MIN_ROOM_NUMBER + 1)) + MIN_ROOM_NUMBER).toString();
        while (this.gameState.has(roomId)) {
            roomId = (Math.floor(Math.random() * (MAX_ROOM_NUMBER - MIN_ROOM_NUMBER + 1)) + MIN_ROOM_NUMBER).toString();
        }
        return roomId;
    }

    private getUser(userId: string): UserData {
        const game = this.getActiveGame(userId);
        if (!game) {
            return undefined;
        }
        return game.getUser(userId);
    }

    private shuffleAndSliceQuestions(questions: unknown[], number: number): unknown[] {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        return questions.slice(0, number);
    }
}
