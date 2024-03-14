import { UserData } from '@app/model/classes/user';
import { GameData } from '@app/model/database/game';
import { TIMEOUT_DURATION, TIME_CONFIRM_MS, WAITING_TIME_MS } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Question } from '@common/interfaces/question';
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

    get currentQuestionWithoutAnswer(): Question {
        const data: Question = {
            ...this.game.questions[this.questionIndex],
        };
        return {
            type: data.type,
            text: data.text,
            points: data.points,
            choices: data.choices.map((choice) => {
                return {
                    text: choice.text,
                    isCorrect: false,
                };
            }),
        };
    }

    get currentQuestionWithAnswer(): Question {
        return {
            ...this.game.questions[this.questionIndex],
        };
    }

    get currentState() {
        return this.state;
    }

    get gameStatePayload(): GameStatePayload {
        if (this.state === GameState.AskingQuestion) {
            return { state: this.state, payload: this.currentQuestionWithoutAnswer };
        }
        if (this.state === GameState.ShowResults) {
            return { state: this.state, payload: this.currentQuestionWithAnswer };
        }
        return { state: this.state };
    }

    set isLocked(locked: boolean) {
        this.locked = locked;
    }

    handleChoices(userId: string, choice: boolean[]) {
        const user = this.users.get(userId);
        if (!user) {
            return;
        }
        user.newChoice = choice;
    }

    canRejoin(userId: string): boolean {
        return this.activeUsers.has(userId);
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
        return this.bannedNames.includes(name.toLowerCase());
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
        this.bannedNames.push(name.toLowerCase());
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

    async launchGame() {
        this.advanceState(GameState.Starting);
        await setTimeout(WAITING_TIME_MS);

        while (this.questionIndex < this.game.questions.length) {
            this.advanceState(GameState.AskingQuestion);
            await setTimeout(this.game.duration * TIMEOUT_DURATION);

            this.advanceState(GameState.ShowResults);
            await setTimeout(TIME_CONFIRM_MS);
            ++this.questionIndex;
        }
    }

    private advanceState(state: GameState) {
        this.state = state;
        this.updateState(this.roomId, this.gameStatePayload);
    }
}
