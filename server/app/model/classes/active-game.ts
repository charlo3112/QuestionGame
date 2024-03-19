import { CountDownTimer } from '@app/model/classes/time';
import { UserData } from '@app/model/classes/user';
import { GameData } from '@app/model/database/game';
import { TIME_CONFIRM_S, WAITING_TIME_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';

export class ActiveGame {
    private locked: boolean;
    private game: GameData;
    private users: Map<string, UserData>;
    private state: GameState = GameState.Wait;
    private bannedNames: string[];
    private activeUsers: Set<string>;
    private updateState: (roomId: string, gameStatePayload: GameStatePayload) => void;
    private updateScore: (userId: string, score: Score) => void;
    private updateUsersStat: (userId: string, usersStat: UserStat[]) => void;
    private roomId: string;
    private questionIndex: number = 0;
    private timer;

    // This class needs all these parameters to be able to communicate with the server
    // eslint-disable-next-line max-params
    constructor(
        game: GameData,
        roomId: string,
        updateState: (roomId: string, gameStatePayload: GameStatePayload) => void,
        updateTime: (roomId: string, time: number) => void,
        updateScore: (userId: string, score: Score) => void,
        updateUsersStat: (userId: string, usersStat: UserStat[]) => void,
    ) {
        this.game = game;
        this.users = new Map<string, UserData>();
        this.activeUsers = new Set<string>();
        this.locked = false;
        this.state = GameState.Wait;
        this.bannedNames = [];
        this.roomId = roomId;
        this.updateState = updateState;
        this.timer = new CountDownTimer(roomId, updateTime);
        this.updateScore = updateScore;
        this.updateUsersStat = updateUsersStat;
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
        if (this.state === GameState.Starting) {
            return { state: this.state, payload: this.game.title };
        }
        if (this.state === GameState.AskingQuestion) {
            return { state: this.state, payload: this.currentQuestionWithoutAnswer };
        }
        if (this.state === GameState.ShowResults) {
            return { state: this.state, payload: this.currentQuestionWithAnswer };
        }
        return { state: this.state };
    }

    get usersStat(): UserStat[] {
        return Array.from(this.users.values())
            .filter((user) => !user.isHost())
            .map((user) => {
                return {
                    username: user.username,
                    score: user.userScore.score,
                    bonus: user.userBonus,
                    isConnected: this.activeUsers.has(user.uid),
                };
            });
    }

    set isLocked(locked: boolean) {
        this.locked = locked;
    }

    handleChoice(userId: string, choice: boolean[]) {
        const user = this.users.get(userId);
        if (!user) {
            return;
        }
        if (user.validate !== undefined) {
            return;
        }
        user.newChoice = choice;
    }

    validateChoice(userId: string) {
        const user = this.users.get(userId);
        if (!user) {
            return;
        }
        user.validate = new Date().getTime();
    }

    canRejoin(userId: string): boolean {
        return this.activeUsers.has(userId);
    }

    addUser(user: UserData) {
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
    }

    getUser(userId: string): UserData {
        return this.users.get(userId);
    }

    needToClosed(): boolean {
        return this.activeUsers.size === 0 || (this.activeUsers.size === 1 && this.roomId.slice(0, 'test'.length) !== 'test');
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
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
    }

    userExists(name: string) {
        return Array.from(this.users.values()).some((user) => user.username.toLowerCase() === name.toLowerCase());
    }

    banUser(name: string): string {
        if (this.currentState !== GameState.Wait) {
            return undefined;
        }
        this.bannedNames.push(name.toLowerCase());
        const userId = Array.from(this.users.values()).find((user) => user.username === name)?.uid;
        this.users.delete(userId);
        this.activeUsers.delete(userId);
        return userId;
    }

    getUsers(): string[] {
        return Array.from(this.users.values()).map((user) => user.username);
    }

    getScore(userId: string): Score {
        const user = this.users.get(userId);
        if (!user) {
            return { score: 0, bonus: false };
        }
        return user.userScore;
    }

    isValidate(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        return user.validate === undefined ? false : true;
    }

    getChoice(userId: string): boolean[] {
        const user = this.users.get(userId);
        if (!user) {
            return [false, false, false, false];
        }
        return user.userChoice === undefined ? [false, false, false, false] : user.userChoice;
    }

    async launchGame() {
        this.advanceState(GameState.Starting);
        await this.timer.start(WAITING_TIME_S);
        await this.askQuestion();
    }

    async testGame() {
        this.advanceState(GameState.Starting);
        while (this.questionIndex < this.game.questions.length) {
            await this.askQuestion();
        }
    }

    async advance() {
        switch (this.state) {
            case GameState.Wait:
                if (!this.isLocked) {
                    return null;
                }
                await this.launchGame();
                break;
            case GameState.ShowResults:
                if (this.questionIndex < this.game.questions.length) {
                    await this.timer.start(TIME_CONFIRM_S);
                    await this.askQuestion();
                } else {
                    this.advanceState(GameState.GameOver);
                }
                break;
            default:
                break;
        }
    }

    private advanceState(state: GameState) {
        this.state = state;
        this.updateState(this.roomId, this.gameStatePayload);
    }

    private resetAnswers() {
        this.users.forEach((user) => {
            user.resetChoice();
        });
    }

    private calculateScores() {
        const correctAnswers = this.game.questions[this.questionIndex].choices.map((choice) => choice.isCorrect);
        let users = Array.from(this.users.values());

        const time = new Date().getTime();

        users.forEach((user) => {
            if (user.validate === undefined) {
                user.validate = time;
            }
        });

        users = users.filter((user) => user.goodAnswer(correctAnswers)).sort((a, b) => b.validate - a.validate);
        const score = this.game.questions[this.questionIndex].points;

        users.forEach((user) => {
            if (users[0] === user) {
                user.addBonus(score);
            } else {
                user.addScore(score);
            }
        });

        this.users.forEach((user) => {
            this.updateScore(user.uid, user.userScore);
            if (user.isHost()) {
                this.updateUsersStat(user.uid, this.usersStat);
            }
        });
    }

    private async askQuestion() {
        this.resetAnswers();
        this.advanceState(GameState.AskingQuestion);
        await this.timer.start(this.game.duration);

        this.calculateScores();
        this.advanceState(GameState.ShowResults);
        ++this.questionIndex;
    }
}
