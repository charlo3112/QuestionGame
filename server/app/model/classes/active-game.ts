import { User } from '@app/model/classes/user';
import { Game } from '@app/model/database/game';
import { GameState } from '@common/game-state';

export class ActiveGame {
    private locked: boolean;
    private game: Game;
    private users: Map<string, User>;
    private state: GameState;
    private bannedNames: string[];

    constructor(game: Game) {
        this.game = game;
        this.users = new Map<string, User>();
        this.locked = false;
        this.state = GameState.Wait;
        this.bannedNames = [];
    }

    get gameData() {
        return this.game;
    }

    get isLocked() {
        return this.locked;
    }

    get currentState() {
        return this.state;
    }

    set isLocked(locked: boolean) {
        this.locked = locked;
    }

    addUser(user: User) {
        this.users[user.getUserId()] = user;
    }

    getUser(userId: string): User {
        return this.users.get(userId);
    }

    isEmpty(): boolean {
        return this.users.size === 0;
    }

    removeUser(user: User) {
        delete this.users[user.getUserId()];
    }

    isBanned(name: string) {
        return this.bannedNames.includes(name);
    }
}
