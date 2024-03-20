import { CountDownTimer } from '@app/model/classes/time/time';
import { UserData } from '@app/model/classes/user/user';
import { GameData } from '@app/model/database/game';
import { BONUS_TIME, TIME_CONFIRM_S, WAITING_TIME_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
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
    private updateHistogramData: (roomId: string, histogramData: HistogramData) => void;
    private roomId: string;
    private questionIndex: number = 0;
    private timer;
    private histogramData: HistogramData;

    // This class needs all these parameters to be able to communicate with the server
    // eslint-disable-next-line max-params
    constructor(
        game: GameData,
        roomId: string,
        updateState: (roomId: string, gameStatePayload: GameStatePayload) => void,
        updateTime: (roomId: string, time: number) => void,
        updateScore: (userId: string, score: Score) => void,
        updateUsersStat: (userId: string, usersStat: UserStat[]) => void,
        updateHistogramData: (roomId: string, histogramData: HistogramData) => void,
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
        this.updateHistogramData = updateHistogramData;
        this.histogramData = {
            choicesCounters: Array.from({ length: this.game.questions.length }, () => [0, 0, 0, 0]),
            question: this.game.questions,
            indexCurrentQuestion: 0,
        };
    }

    get currentQuestionWithAnswer(): Question {
        return {
            ...this.game.questions[this.questionIndex],
        };
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

    get currentState() {
        return this.state;
    }

    get gameData() {
        return this.game;
    }

    get gameStatePayload(): GameStatePayload {
        if (this.state === GameState.Starting) {
            return { state: this.state, payload: this.game.title };
        }
        if (this.state === GameState.AskingQuestion) {
            return { state: this.state, payload: this.currentQuestionWithoutAnswer };
        }
        if (this.state === GameState.ShowResults || this.state === GameState.LastQuestion) {
            return { state: this.state, payload: this.currentQuestionWithAnswer };
        }
        return { state: this.state };
    }

    get hostId() {
        return Array.from(this.users.values()).find((user) => user.isHost())?.uid;
    }

    get isLocked() {
        return this.locked;
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

    addUser(user: UserData) {
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
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

    canRejoin(userId: string): boolean {
        return this.activeUsers.has(userId);
    }

    getChoice(userId: string): boolean[] {
        const user = this.users.get(userId);
        if (!user) {
            return [false, false, false, false];
        }
        return user.userChoice === undefined ? [false, false, false, false] : user.userChoice;
    }

    getScore(userId: string): Score {
        const user = this.users.get(userId);
        if (!user) {
            return { score: 0, bonus: false };
        }
        return user.userScore;
    }

    getUser(userId: string): UserData {
        return this.users.get(userId);
    }

    getUsers(): string[] {
        return Array.from(this.users.values()).map((user) => user.username);
    }

    handleChoice(userId: string, choice: boolean[]) {
        const user = this.users.get(userId);
        if (!user) {
            return;
        }
        if (user.validate !== undefined && this.state === GameState.AskingQuestion) {
            return;
        }
        user.newChoice = choice;
        this.sendUserSelectedChoice();
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

    isValidate(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        return user.validate === undefined ? false : true;
    }

    needToClosed(): boolean {
        return this.activeUsers.size === 0 || (this.activeUsers.size === 1 && this.roomId.slice(0, 'test'.length) !== 'test');
    }

    removeUser(userId: string) {
        this.activeUsers.delete(userId);
        if (this.state === GameState.Wait) {
            this.users.delete(userId);
        }
        this.updateUsersStat(this.hostId, this.usersStat);
    }

    sendUserSelectedChoice() {
        this.histogramData.choicesCounters[this.questionIndex] = [0, 0, 0, 0];
        this.users.forEach((user) => {
            for (let i = 0; i < this.game.questions[this.questionIndex].choices.length; i++) {
                if (!user.userChoice) {
                    break;
                }
                if (user.userChoice[i]) {
                    this.histogramData.choicesCounters[this.questionIndex][i]++;
                }
            }
        });
        this.updateHistogramData(this.hostId, this.histogramData);
    }

    showFinalResults() {
        this.advanceState(GameState.ShowFinalResults);
        this.updateUsersStat(this.roomId, this.usersStat);
        this.updateHistogramData(this.roomId, this.histogramData);
    }

    update(userId: string, user: UserData) {
        this.users.delete(userId);
        this.activeUsers.delete(userId);
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
        if (user.isHost() || this.currentState === GameState.ShowFinalResults) {
            this.updateUsersStat(user.uid, this.usersStat);
            this.updateHistogramData(user.uid, this.histogramData);
        }
    }

    userExists(name: string) {
        return Array.from(this.users.values()).some((user) => user.username.toLowerCase() === name.toLowerCase());
    }

    validateChoice(userId: string) {
        const user = this.users.get(userId);
        if (!user) {
            return;
        }
        user.validate = new Date().getTime();
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

    async askQuestion() {
        this.histogramData.indexCurrentQuestion = this.questionIndex;
        this.updateHistogramData(this.hostId, this.histogramData);
        this.resetAnswers();
        this.advanceState(GameState.AskingQuestion);
        await this.timer.start(this.game.duration);

        this.calculateScores();
        this.advanceState(GameState.ShowResults);
        if (++this.questionIndex === this.game.questions.length) this.advanceState(GameState.LastQuestion);
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
            await this.timer.start(TIME_CONFIRM_S);
        }
    }

    private advanceState(state: GameState) {
        this.state = state;
        this.updateState(this.roomId, this.gameStatePayload);
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

        let bonus = true;
        if (users.length >= 2) {
            if (users[1].validate - users[0].validate >= BONUS_TIME) {
                bonus = false;
            }
        }

        users.forEach((user) => {
            if (users[0] === user && bonus) {
                user.addBonus(score);
            } else {
                user.addScore(score);
            }
        });
        this.updateUsersStat(this.hostId, this.usersStat);
    }

    private resetAnswers() {
        this.users.forEach((user) => {
            user.resetChoice();
        });
    }
}
