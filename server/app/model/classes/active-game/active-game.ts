import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { CountDownTimer } from '@app/model/classes/time/time';
import { UserData } from '@app/model/classes/user/user';
import { Users } from '@app/model/classes/users/users';
import { GameData } from '@app/model/database/game';
import { TIME_CONFIRM_S, WAITING_TIME_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';

export class ActiveGame {
    isLocked: boolean;
    private users: Users;
    private game: GameData;
    private state: GameState = GameState.Wait;
    private roomId: string;
    private questionIndex: number = 0;
    private histogramData: HistogramData;
    private timer: CountDownTimer;
    private gameGateway: GameGatewaySend;

    // TODO: Justify the number of parameters for this constructor or reduce it
    constructor(game: GameData, roomId: string, gameWebsocket: GameGatewaySend, hostIsPlaying: boolean = false) {
        this.gameGateway = gameWebsocket;
        this.game = game;
        this.roomId = roomId;
        this.timer = new CountDownTimer(roomId, gameWebsocket);
        this.isLocked = false;
        this.state = GameState.Wait;
        this.users = new Users(gameWebsocket, hostIsPlaying);
        this.histogramData = {
            choicesCounters: Array.from({ length: this.game.questions.length }, () => [0, 0, 0, 0]),
            question: this.game.questions,
            indexCurrentQuestion: 0,
        };
    }

    get currentState(): GameState {
        return this.state;
    }

    get gameData(): GameData {
        return this.game;
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

    get questionIndexCurrent(): number {
        return this.questionIndex;
    }

    get usersArray(): string[] {
        return this.users.usersArray;
    }

    addUser(user: UserData): void {
        this.users.addUser(user);
    }

    banUser(name: string): string {
        if (this.currentState !== GameState.Wait) {
            return undefined;
        }
        return this.users.banUser(name);
    }

    canRejoin(userId: string): boolean {
        return this.users.canRejoin(userId);
    }

    getChoice(userId: string): boolean[] {
        return this.users.getChoice(userId);
    }

    getScore(userId: string): Score {
        return this.users.getScore(userId);
    }

    getUser(userId: string): UserData {
        return this.users.getUser(userId);
    }

    handleChoice(userId: string, choice: boolean[]): void {
        if (this.state !== GameState.AskingQuestion) {
            return;
        }
        this.users.handleChoice(userId, choice);
        this.sendUserSelectedChoice();
    }

    isValidate(userId: string): boolean {
        return this.users.isValidate(userId);
    }

    isBanned(name: string): boolean {
        return this.users.isBanned(name);
    }

    needToClosed(): boolean {
        return this.users.size === 0 || (this.users.size === 1 && !this.users.hostIsPlaying);
    }

    isHost(userId: string): boolean {
        return this.users.isHost(userId);
    }

    removeUser(userId: string): void {
        this.users.removeActiveUser(userId);
        if (this.state === GameState.Wait) {
            this.users.removeUser(userId);
        }
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
    }

    sendUserSelectedChoice(): void {
        this.histogramData.choicesCounters[this.questionIndex] = this.users.getCurrentHistogramData(this.game.questions[this.questionIndex].choices);
        this.gameGateway.sendHistogramDataUpdate(this.users.hostId, this.histogramData);
    }

    showFinalResults(): void {
        this.advanceState(GameState.ShowFinalResults);
        this.gameGateway.sendUsersStatUpdate(this.roomId, this.users.usersStat);
        this.gameGateway.sendHistogramDataUpdate(this.roomId, this.histogramData);
    }

    setChat(hostId: string, username: string, value: boolean): string | undefined {
        return this.users.setChat(hostId, username, value);
    }

    canChat(userId: string): boolean {
        return this.users.canChat(userId);
    }

    update(userId: string, newId: string): void {
        const isHost = this.users.update(userId, newId);
        if (isHost || this.currentState === GameState.ShowFinalResults) {
            this.gameGateway.sendUsersStatUpdate(newId, this.users.usersStat);
            this.gameGateway.sendHistogramDataUpdate(newId, this.histogramData);
        }
    }

    userExists(name: string): boolean {
        return this.users.userExists(name);
    }

    validateChoice(userId: string): void {
        this.users.validateChoice(userId);
        if (this.users.allHaveValidated) {
            this.timer.stop();
        }
    }

    async advance(): Promise<void> {
        switch (this.state) {
            case GameState.Wait:
                if (!this.isLocked) {
                    return;
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

    async askQuestion(): Promise<void> {
        this.histogramData.indexCurrentQuestion = this.questionIndex;
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
        this.gameGateway.sendHistogramDataUpdate(this.users.hostId, this.histogramData);
        this.users.resetAnswers();
        this.advanceState(GameState.AskingQuestion);
        await this.timer.start(this.game.duration);

        const correctAnswers = this.game.questions[this.questionIndex].choices.map((choice) => choice.isCorrect);
        this.users.updateUsersScore(correctAnswers, this.game.questions[this.questionIndex].points);
        this.advanceState(GameState.ShowResults);
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
        if (++this.questionIndex === this.game.questions.length) this.advanceState(GameState.LastQuestion);
    }

    async launchGame(): Promise<void> {
        this.advanceState(GameState.Starting);
        await this.timer.start(WAITING_TIME_S);
        await this.askQuestion();
    }

    async testGame(): Promise<void> {
        this.advanceState(GameState.Starting);
        while (this.questionIndex < this.game.questions.length) {
            await this.askQuestion();
            await this.timer.start(TIME_CONFIRM_S);
        }
    }

    private advanceState(state: GameState): void {
        this.state = state;
        this.gameGateway.sendStateUpdate(this.roomId, this.gameStatePayload);
    }
}
