import { UserData } from '@app/model/classes/user';
import { Game } from '@app/model/database/game';
import { GameState } from '@common/game-state';

export class ActiveGame {
    private locked: boolean;
    private game: Game;
    private users: Map<string, UserData>;
    private state: GameState;
    private bannedNames: string[];
    private activeUsers: Set<string>;

    constructor(game: Game) {
        this.game = game;
        this.users = new Map<string, UserData>();
        this.activeUsers = new Set<string>();
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

    addUser(user: UserData) {
        this.users.set(user.getUserId(), user);
        this.activeUsers.add(user.getUserId());
    }

    getUser(userId: string): UserData {
        return this.users.get(userId);
    }

    needToClosed(): boolean {
        return this.activeUsers.size === 0 || this.activeUsers.size === 1;
    }

    removeUser(user: UserData) {
        this.activeUsers.delete(user.getUserId());
        if (this.state === GameState.Wait) {
            this.users.delete(user.getUserId());
        }
    }

    isBanned(name: string) {
        return this.bannedNames.includes(name);
    }

    update(userId: string, user: UserData) {
        this.users.delete(userId);
        this.activeUsers.delete(userId);
        this.users.set(user.getUserId(), user);
        this.activeUsers.add(user.getUserId());
    }

    userExists(name: string) {
        return Array.from(this.users.values()).some((user) => user.username.toLowerCase() === name.toLowerCase());
    }

    banUser(name: string): string {
        this.bannedNames.push(name);
        const userId = Array.from(this.users.values())
            .find((user) => user.username === name)
            ?.getUserId();
        this.users.delete(userId);
        this.activeUsers.delete(userId);
        return userId;
    }

    getUsers(): string[] {
        return Array.from(this.users.values()).map((user) => user.username);
    }
}
