import { ActiveGame } from '@app/model/classes/active-game';
import { User } from '@app/model/classes/user';
import { Game } from '@app/model/database/game';
import { GameState } from '@common/game-state';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RoomManagementService {
    private gameState: Map<string, ActiveGame> = new Map();
    private roomMembers: Map<string, string> = new Map();
    private deleteRoomGatewayCallback: ((roomID: string) => void)[] = [];

    constructor(private readonly logger: Logger) {}
    setGatewayCallback(deleteRoom: (roomID: string) => void) {
        this.deleteRoomGatewayCallback.push(deleteRoom);
    }

    createGame(roomId: string, game: Game) {
        const host: User = new User(roomId, roomId, 'Organisateur');
        const newActiveGame: ActiveGame = new ActiveGame(game);
        newActiveGame.addUser(host);

        this.gameState.set(roomId, newActiveGame);
        this.roomMembers.set(host.getUserId(), roomId);

        return roomId;
    }

    toggleGameClosed(userId: string, closed: boolean) {
        const roomId = this.roomMembers.get(userId);
        const game = this.gameState.get(roomId);
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

    joinRoom(userId: string, roomId: string, username: string): GameState {
        if (!roomId) {
            return GameState.RefusedWrongCode;
        }
        const activeGame = this.gameState.get(roomId);
        const isLocked = activeGame.isLocked;
        if (isLocked) {
            return GameState.RefusedWrongCode;
        }
        if (activeGame.isBanned(username)) {
            return GameState.RefusedBanned;
        }
        const newUser: User = new User(userId, roomId, username);
        this.roomMembers.set(userId, roomId);
        activeGame.addUser(newUser);
        return GameState.Wait;
    }

    leaveUser(userId: string): string {
        const roomId = this.roomMembers.get(userId);
        const game = this.gameState.get(roomId);
        const user = game.getUser(userId);
        if (user.username === 'Organisateur') {
            this.deleteRoomGatewayCallback.forEach((callback) => callback(roomId));
            this.gameState.delete(roomId);
        }
        const activeGame = this.gameState.get(roomId);
        activeGame.removeUser(user);
        this.roomMembers.delete(userId);
        if (activeGame.isEmpty()) {
            this.deleteRoomGatewayCallback.forEach((callback) => callback(roomId));
            this.gameState.delete(roomId);
        }
        return roomId;
    }

    getRoomId(userId: string): string {
        return this.roomMembers.get(userId);
    }

    private getUser(userId: string) {
        const roomId = this.roomMembers.get(userId);
        return this.gameState.get(roomId).getUser(userId);
    }
}
