import { ActiveGame } from '@app/model/classes/active-game';
import { UserData } from '@app/model/classes/user';
import { Game } from '@app/model/database/game';
import { MAX_ROOM_NUMBER, MIN_ROOM_NUMBER, TIMEOUT_DURATION } from '@common/constants';
import { GameState } from '@common/game-state';
import { Result } from '@common/result';
import { User } from '@common/user.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RoomManagementService {
    private gameState: Map<string, ActiveGame> = new Map();
    private roomMembers: Map<string, string> = new Map();
    private deleteRoomGatewayCallback: ((roomID: string) => void)[] = [];
    private disconnectionTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(private readonly logger: Logger) {}
    setGatewayCallback(deleteRoom: (roomID: string) => void) {
        this.deleteRoomGatewayCallback.push(deleteRoom);
    }

    createGame(userId: string, game: Game): User {
        const roomId = this.generateRoomId();
        const host: UserData = new UserData(userId, roomId, 'Organisateur');
        const newActiveGame: ActiveGame = new ActiveGame(game);
        newActiveGame.addUser(host);

        this.gameState.set(roomId, newActiveGame);
        this.roomMembers.set(host.getUserId(), roomId);

        return { name: 'Organisateur', roomId, userId };
    }

    toggleGameClosed(userId: string, closed: boolean) {
        const roomId = this.roomMembers.get(userId);
        const game = this.gameState.get(roomId);
        if (!game) {
            return;
        }
        const user = game.getUser(userId);
        if (!user.isHost()) {
            return;
        }

        if (game.currentState !== GameState.Wait) {
            return;
        }
        this.gameState.get(roomId).isLocked = closed;
    }

    launchGame(userId: string): GameState | undefined {
        const host = this.getUser(userId);
        if (!host.isHost()) {
            return undefined;
        }
        const roomId = this.roomMembers.get(userId);
        const state: GameState = this.gameState.get(roomId).currentState;
        if (state !== GameState.Wait) {
            return undefined;
        }
        const isLocked = this.gameState.get(roomId).isLocked;
        if (!isLocked) {
            return undefined;
        }
        // TODO: Use service to start game
        return GameState.Starting;
    }

    joinRoom(userId: string, roomId: string, username: string): Result<GameState> {
        const activeGame = this.gameState.get(roomId);
        if (!activeGame) {
            return { ok: false, error: 'Code invalide' };
        }
        if (this.roomMembers.has(userId)) {
            this.performUserRemoval(userId);
        }
        const isLocked = activeGame.isLocked;
        if (isLocked) {
            return { ok: false, error: 'Room verouiller' };
        }
        if (activeGame.isBanned(username) || activeGame.userExists(username)) {
            return { ok: false, error: 'Le nom est deja pris ou bannie' };
        }
        const newUser: UserData = new UserData(userId, roomId, username);
        this.roomMembers.set(userId, roomId);
        activeGame.addUser(newUser);
        return { ok: true, value: activeGame.currentState };
    }

    rejoinRoom(user: User, newUserId: string): Result<GameState> {
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
        return { ok: true, value: activeGame.currentState };
    }

    leaveUser(userId: string): void {
        const roomId = this.roomMembers.get(userId);
        const game = this.gameState.get(roomId);
        if (!game) {
            return;
        }
        const user = game.getUser(userId);
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

    getUsername(userId: string): string {
        const roomId = this.roomMembers.get(userId);
        if (!roomId) {
            return undefined;
        }
        const user = this.gameState.get(roomId).getUser(userId);
        if (!user) {
            return undefined;
        }
        return user.username;
    }

    performUserRemoval(userId: string): string {
        const roomId = this.roomMembers.get(userId);
        const game = this.gameState.get(roomId);
        if (!game) {
            return roomId;
        }
        const user = game.getUser(userId);
        if (!user) {
            return roomId;
        }
        if (user.username === 'Organisateur') {
            this.deleteRoomGatewayCallback.forEach((callback) => callback(roomId));
            this.gameState.delete(roomId);
            return roomId;
        }
        const activeGame = this.gameState.get(roomId);
        if (!activeGame) {
            return roomId;
        }
        activeGame.removeUser(user);
        this.roomMembers.delete(userId);
        if (activeGame.needToClosed()) {
            this.deleteRoomGatewayCallback.forEach((callback) => callback(roomId));
            this.gameState.delete(roomId);
        }
        return roomId;
    }

    banUser(userId: string, bannedUsername: string): string {
        const roomId = this.roomMembers.get(userId);
        const game = this.gameState.get(roomId);
        if (!game) {
            return;
        }
        const user = game.getUser(userId);
        if (!user || !user.isHost()) {
            return;
        }
        return game.banUser(bannedUsername);
    }

    private getUser(userId: string): UserData {
        const roomId = this.roomMembers.get(userId);
        if (!roomId) {
            return undefined;
        }
        return this.gameState.get(roomId).getUser(userId);
    }

    private generateRoomId(): string {
        let roomId = (Math.floor(Math.random() * (MAX_ROOM_NUMBER - MIN_ROOM_NUMBER + 1)) + MIN_ROOM_NUMBER).toString();
        while (this.gameState.has(roomId)) {
            roomId = (Math.floor(Math.random() * (MAX_ROOM_NUMBER - MIN_ROOM_NUMBER + 1)) + MIN_ROOM_NUMBER).toString();
        }
        return roomId;
    }
}
