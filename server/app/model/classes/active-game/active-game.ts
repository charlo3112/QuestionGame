import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { CountDownTimer } from '@app/model/classes/time/time';
import { UserData } from '@app/model/classes/user/user';
import { Users } from '@app/model/classes/users/users';
import { GameData } from '@app/model/database/game';
import { CreateHistoryDto } from '@app/model/dto/history/create-history.dto';
import { HistoryService } from '@app/services/history/history.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S, QRL_TIME, TIME_CONFIRM_S, WAITING_TIME_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
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
    private historyService: HistoryService | undefined;
    private isActive: boolean;
    private qrlAnswers: QrlAnswer[] = [
        {
            player: 'lol',
            text: 'lolo',
            grade: Grade.Ungraded,
        },
    ];

    // TODO: Justify the number of parameters for this constructor or reduce it
    // eslint-disable-next-line max-params
    constructor(
        game: GameData,
        roomId: string,
        gameWebsocket: GameGatewaySend,
        historyService: HistoryService | undefined,
        hostIsPlaying: boolean = false,
    ) {
        this.gameGateway = gameWebsocket;
        this.game = game;
        this.roomId = roomId;
        this.timer = new CountDownTimer(roomId, gameWebsocket);
        this.isLocked = false;
        this.state = GameState.Wait;
        this.users = new Users(gameWebsocket, hostIsPlaying);
        this.historyService = historyService;
        this.histogramData = {
            choicesCounters: Array.from({ length: this.game.questions.length }, () => [0, 0, 0, 0]),
            question: this.game.questions,
            indexCurrentQuestion: 0,
        };
        this.isActive = true;
    }

    get currentState(): GameState {
        return this.state;
    }

    get gameData(): GameData {
        return this.game;
    }

    get currentQuestionWithAnswer(): Question {
        return this.game.questions[this.questionIndex] as Question;
    }

    get currentQuestionWithoutAnswer(): Question {
        const data = this.game.questions[this.questionIndex] as Question;
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

    getQrlAnswers(): QrlAnswer[] {
        return this.qrlAnswers;
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

    handleAnswers(userId: string, answers: QrlAnswer[]): void {
        if (this.state !== GameState.AskingQuestion) {
            return;
        }
        this.users.handleAnswers(userId, answers);
        this.qrlAnswers = answers;
    }

    handleQrlAnswer(userId: string, answer: QrlAnswer): void {
        if (this.state !== GameState.AskingQuestion) {
            return;
        }
        for (let qrlAnswer of this.qrlAnswers) {
            if (qrlAnswer.player === answer.player) {
                qrlAnswer = answer;
            } else this.qrlAnswers.push(answer);
        }
        /// /////ICI
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
        this.users.resetFinalResults();
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

    stopGame(): void {
        delete this.users;
        this.users = new Users(this.gameGateway, false);
        this.roomId = '';
        this.isActive = false;
        this.timer.stop();
    }

    startPanicking(): void {
        if (
            this.state !== GameState.AskingQuestion ||
            (this.currentQuestionWithAnswer.type === 'QCM' && this.timer.seconds <= MIN_TIME_PANIC_QCM_S) ||
            (this.currentQuestionWithAnswer.type === 'QRL' && this.timer.seconds <= MIN_TIME_PANIC_QRL_S)
        ) {
            return;
        }
        this.timer.panic = true;
    }

    togglePause(): void {
        if (this.state !== GameState.AskingQuestion) {
            return;
        }
        this.timer.toggle();
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
                    ++this.questionIndex;
                    await this.askQuestion();
                } else {
                    this.advanceState(GameState.ShowFinalResults);
                }
                break;
            default:
                break;
        }
    }

    async askQuestion(): Promise<void> {
        if (!this.isActive) return;
        this.histogramData.indexCurrentQuestion = this.questionIndex;
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
        this.gameGateway.sendHistogramDataUpdate(this.users.hostId, this.histogramData);
        this.users.resetAnswers();
        this.advanceState(GameState.AskingQuestion);
        if (this.currentQuestionWithoutAnswer.type === QuestionType.QCM) {
            await this.timer.start(this.game.duration);
        } else if (this.currentQuestionWithoutAnswer.type === QuestionType.QRL) {
            await this.timer.start(QRL_TIME);
        }
        this.timer.panic = false;
        if (!this.isActive) return;

        const correctAnswers = this.game.questions[this.questionIndex].choices.map((choice) => choice.isCorrect);
        this.users.updateUsersScore(correctAnswers, this.game.questions[this.questionIndex].points);
        this.advanceState(GameState.ShowResults);
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);

        if (this.questionIndex + 1 === this.game.questions.length) {
            this.advanceState(GameState.LastQuestion);
            if (this.historyService) {
                const history: CreateHistoryDto = {
                    name: this.game.title,
                    date: new Date(),
                    numberPlayers: this.users.totalSize,
                    bestScore: this.users.bestScore,
                };
                this.historyService.addHistory(history);
                if (this.users.hostIsPlaying) {
                    await this.timer.start(TIME_CONFIRM_S);
                    if (!this.isActive) return;
                    this.showFinalResults();
                }
            }
        } else if (this.users.hostIsPlaying) {
            await this.timer.start(TIME_CONFIRM_S);
            ++this.questionIndex;
            await this.askQuestion();
        }
    }

    async launchGame(): Promise<void> {
        this.advanceState(GameState.Starting);
        await this.timer.start(WAITING_TIME_S);
        await this.askQuestion();
    }

    private advanceState(state: GameState): void {
        this.state = state;
        this.gameGateway.sendStateUpdate(this.roomId, this.gameStatePayload);
    }
}
