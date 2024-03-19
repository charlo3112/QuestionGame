import { CountDownTimer } from '@app/model/classes/time';
import { UserData } from '@app/model/classes/user';
import { GameData } from '@app/model/database/game';
import { TIME_CONFIRM_S, WAITING_TIME_S, WAIT_FOR_NEXT_QUESTION } from '@common/constants';
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
    private readyForNextQuestion: boolean = false;
    private histogramData: HistogramData;

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

    get gameData() {
        return this.game;
    }

    get isLocked() {
        return this.locked;
    }

    get hostId() {
        return Array.from(this.users.values()).find((user) => user.isHost())?.uid;
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
        if (this.state === GameState.ShowResults || this.state === GameState.LastQuestion) {
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
        if (user.validate !== undefined && this.state === GameState.AskingQuestion) {
            return;
        }
        user.newChoice = choice;
        this.sendUserSelectedChoice();
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

    nextQuestion() {
        this.readyForNextQuestion = true;
    }

    addUser(user: UserData) {
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
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

    showFinalResults() {
        this.advanceState(GameState.ShowFinalResults);
        this.updateUsersStat(this.roomId, this.usersStat);
        this.updateHistogramData(this.roomId, this.histogramData);
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

        while (this.questionIndex < this.game.questions.length) {
            await this.askQuestion();
        }
    }

    async askQuestion() {
        this.resetAnswers();
        this.advanceState(GameState.AskingQuestion);
        await this.timer.start(this.game.duration);

        this.calculateScores();
        this.advanceState(GameState.ShowResults);
        await this.timer.start(TIME_CONFIRM_S);
        if (++this.questionIndex === this.game.questions.length) this.advanceState(GameState.LastQuestion);
        else {
            while (!this.readyForNextQuestion) await new Promise((resolve) => setTimeout(resolve, WAIT_FOR_NEXT_QUESTION));
            this.histogramData.indexCurrentQuestion = this.questionIndex;
            this.updateHistogramData(this.hostId, this.histogramData);

            this.readyForNextQuestion = false;
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

        this.updateUsersStat(this.hostId, this.usersStat);
    }
}
