import { ActiveGame } from '@app/model/classes/active-game';
import { UserData } from '@app/model/classes/user';
import { GameData } from '@app/model/database/game';
import { TimeService } from '@app/services/time/time.service';
import { MAX_ROOM_NUMBER, MIN_ROOM_NUMBER, TIMEOUT_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Result } from '@common/interfaces/result';
import { User } from '@common/interfaces/user';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RoomManagementService {
    private gameState: Map<string, ActiveGame> = new Map();
    private roomMembers: Map<string, string> = new Map();
    private deleteRoomGatewayCallback: ((roomID: string) => void)[] = [];
    private disconnectionTimers: Map<string, NodeJS.Timeout> = new Map();
    private disconnectUser: (userId: string, message: string) => void;
    private updateUser: (roomId: string, userUpdate: UserConnectionUpdate) => void;

    constructor(
        private readonly logger: Logger,
        private readonly timeService: TimeService,
    ) {}
    setGatewayCallback(deleteRoom: (roomID: string) => void) {
        this.deleteRoomGatewayCallback.push(deleteRoom);
    }

    setDisconnectUser(disconnectUser: (userId: string, message: string) => void) {
        this.disconnectUser = disconnectUser;
    }

    setUpdateUser(updateUser: (roomId: string, userUpdate: UserConnectionUpdate) => void) {
        this.updateUser = updateUser;
    }

    createGame(userId: string, game: GameData, updateState: (gameStatePayload: GameStatePayload) => void): User {
        const roomId = this.generateRoomId();
        const host: UserData = new UserData(userId, roomId, 'Organisateur');
        const newActiveGame: ActiveGame = new ActiveGame(game, updateState);
        newActiveGame.addUser(host);

        this.gameState.set(roomId, newActiveGame);
        this.roomMembers.set(host.getUserId(), roomId);

        return { name: 'Organisateur', roomId, userId };
    }

    toggleGameClosed(userId: string, closed: boolean) {
        const game = this.getActiveGame(userId);
        if (!game || !game.isHost(userId) || game.currentState !== GameState.Wait) {
            return;
        }
        game.isLocked = closed;
    }

    launchGame(userId: string): GameState | undefined {
        const game = this.getActiveGame(userId);
        if (!game || !game.isHost(userId) || game.currentState !== GameState.Wait || !game.isLocked) {
            return undefined;
        }
        game.launchGame();
    }

    startGame(roomId: string): GameState {
        const game = this.gameState.get(roomId);
        return game.startGame();
    }

    joinRoom(userId: string, roomId: string, username: string): Result<GameStatePayload> {
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
        if (activeGame.isBanned(username) || activeGame.userExists(username)) {
            return { ok: false, error: 'Le nom est déjà pris ou banni' };
        }
        const newUser: UserData = new UserData(userId, roomId, username);
        this.roomMembers.set(userId, roomId);
        activeGame.addUser(newUser);
        const userUpdate: UserConnectionUpdate = { isConnected: true, username };
        this.updateUser(roomId, userUpdate);
        return { ok: true, value: { state: activeGame.currentState } };
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
        if (!this.roomMembers.has(user.userId) || activeGame.isBanned(user.name) || activeGame.getUser(user.userId).username !== user.name) {
            return { ok: false, error: 'Reconnection impossible' };
        }

        this.roomMembers.delete(user.userId);
        this.roomMembers.set(newUserId, user.roomId);
        const newUser: UserData = new UserData(newUserId, user.roomId, user.name);
        activeGame.update(user.userId, newUser);
        return { ok: true, value: { state: activeGame.currentState } };
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
        return game.getUsers();
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
        this.disconnectUser(userId, 'Vous avez été déconnecté');
        if (game.isHost(userId)) {
            this.deleteRoomGatewayCallback.forEach((callback) => callback(roomId));
            this.gameState.delete(roomId);
            return;
        }
        game.removeUser(userId);
        if (game.needToClosed() && game.currentState !== GameState.Wait) {
            this.deleteRoomGatewayCallback.forEach((callback) => callback(roomId));
            this.gameState.delete(roomId);
        }
        const userUpdate: UserConnectionUpdate = { isConnected: false, username };
        this.updateUser(roomId, userUpdate);
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
            this.disconnectUser(banId, 'Vous avez été banni');
            this.roomMembers.delete(banId);
            const userUpdate: UserConnectionUpdate = { isConnected: false, username: bannedUsername };
            this.updateUser(this.getRoomId(userId), userUpdate);
        }
    }

    private generateRoomId(): string {
        let roomId = (Math.floor(Math.random() * (MAX_ROOM_NUMBER - MIN_ROOM_NUMBER + 1)) + MIN_ROOM_NUMBER).toString();
        while (this.gameState.has(roomId)) {
            roomId = (Math.floor(Math.random() * (MAX_ROOM_NUMBER - MIN_ROOM_NUMBER + 1)) + MIN_ROOM_NUMBER).toString();
        }
        return roomId;
    }

    private getActiveGame(userId: string): ActiveGame {
        const roomId = this.roomMembers.get(userId);
        if (!roomId) {
            return undefined;
        }
        return this.gameState.get(roomId);
    }

    private getUser(userId: string): UserData {
        const game = this.getActiveGame(userId);
        if (!game) {
            return undefined;
        }
        return game.getUser(userId);
    }
}
