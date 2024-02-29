import { User } from '@app/model/classes/user';
import { Game } from '@app/model/database/game';
import { RoomState } from '@app/model/enums/room-state';

export class ActiveGame {
    private game: Game;
    private playersHashMap: Map<string, User>;
    private closed: boolean;
    private state: RoomState;

    constructor(game: Game) {
        this.game = game;
        this.playersHashMap = new Map<string, User>();
        this.closed = false;
        this.state = RoomState.WAITING;
    }
    addPlayer(user: User) {
        this.playersHashMap[user.getPlayerId()] = user;
    }

    removePlayer(user: User) {
        delete this.playersHashMap[user.getPlayerId()];
    }

    getGame() {
        return this.game;
    }

    getPlayersHashMap() {
        return this.playersHashMap;
    }
}
