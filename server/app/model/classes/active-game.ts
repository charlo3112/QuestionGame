import { UserData } from '@app/model/classes/user';
import { GameData } from '@app/model/database/game';
import { TIMEOUT_DURATION, TIME_CONFIRM_MS, WAITING_TIME_MS } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload, Payload } from '@common/interfaces/game-state-payload';
import { setTimeout } from 'timers/promises';

export class ActiveGame {
    private locked: boolean;
    private game: GameData;
    private users: Map<string, UserData>;
    private state: GameState = GameState.Wait;
    private bannedNames: string[];
    private activeUsers: Set<string>;
    private updateState: (roomId: string, gameStatePayload: GameStatePayload) => void;
    private roomId: string;
    private ac = new AbortController();
    private questionIndex: number = 0;

    constructor(game: GameData, roomId: string, updateState: (roomId: string, gameStatePayload: GameStatePayload) => void) {
        this.game = game;
        this.users = new Map<string, UserData>();
        this.activeUsers = new Set<string>();
        this.locked = false;
        this.state = GameState.Wait;
        this.bannedNames = [];
        this.roomId = roomId;
        this.updateState = updateState;
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

    removeUser(userId: string) {
        this.activeUsers.delete(userId);
        if (this.state === GameState.Wait) {
            this.users.delete(userId);
        }
    }

    isBanned(name: string) {
        return this.bannedNames.includes(name);
    }

    isHost(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        return user.isHost();
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
        if (this.currentState !== GameState.Wait) {
            return undefined;
        }
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

    startGame() {
        if (this.currentState !== GameState.Wait) {
            return this.currentState;
        }
        this.state = GameState.AskingQuestion;
        return this.currentState;
    }

    async launchGame() {
        await setTimeout(WAITING_TIME_MS);
        this.advanceState(GameState.Starting, this.game);

        while (this.questionIndex < this.game.questions.length) {
            this.advanceState(GameState.AskingQuestion, this.game);
            console.log('asking question');
            console.log(this.game.duration);
            await setTimeout(10 * TIMEOUT_DURATION);
            console.log('showing results');
            this.advanceState(GameState.AskingQuestion, this.game);
            await setTimeout(TIME_CONFIRM_MS);
            ++this.questionIndex;
        }
    }

    private advanceState(state: GameState, payload: Payload = undefined) {
        this.state = state;
        this.updateState(this.roomId, { state: this.state, payload });
    }
}
