import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { GamePlay } from '@app/model/classes/game-play/game-play';
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
import { HistogramData, HistogramQCM, HistogramQRL } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Score } from '@common/interfaces/score';

export class ActiveGame {
    isLocked: boolean;
    private users: Users;
    private game: GamePlay;
    private state: GameState = GameState.WAIT;
    private roomId: string;
    private histogramData: HistogramData;
    private timer: CountDownTimer;
    private gameGateway: GameGatewaySend;
    private historyService: HistoryService | undefined;
    private isActive: boolean;

    // Every line is needed
    // eslint-disable-next-line max-params
    constructor(
        game: GameData,
        roomId: string,
        gameWebsocket: GameGatewaySend,
        historyService: HistoryService | undefined,
        hostIsPlaying: boolean = false,
    ) {
        this.gameGateway = gameWebsocket;
        this.game = new GamePlay(game);
        this.roomId = roomId;
        this.timer = new CountDownTimer(roomId, gameWebsocket);
        this.isLocked = false;
        this.state = GameState.WAIT;
        this.users = new Users(gameWebsocket, hostIsPlaying, this.sendUserSelectedChoice.bind(this));
        this.historyService = historyService;
        Array.from({ length: this.game.questions.length }, () => [0, 0, 0, 0]);
        this.histogramData = {
            histogram: this.game.questions.map((question) => {
                return question.type === QuestionType.QCM
                    ? ({ type: question.type, choicesCounters: [0, 0, 0, 0] } as HistogramQCM)
                    : ({ type: question.type, active: 0, inactive: 0, grades: [] } as HistogramQRL);
            }),
            question: this.game.questions,
            indexCurrentQuestion: 0,
        };
        this.isActive = true;
    }

    get currentState(): GameState {
        return this.state;
    }

    get gameStatePayload(): GameStatePayload {
        if (this.state === GameState.STARTING) {
            return { state: this.state, payload: this.game.title };
        }
        if (
            this.state === GameState.ASKING_QUESTION_QCM ||
            this.state === GameState.ASKING_QUESTION_QRL ||
            this.state === GameState.WAITING_FOR_ANSWERS
        ) {
            return { state: this.state, payload: this.game.currentQuestionWithoutAnswer };
        }
        if (this.state === GameState.SHOW_RESULTS || this.state === GameState.LAST_QUESTION) {
            return { state: this.state, payload: this.game.currentQuestionWithAnswer };
        }
        return { state: this.state };
    }

    get usersArray(): string[] {
        return this.users.usersArray;
    }

    addUser(user: UserData): void {
        this.users.addUser(user);
    }

    banUser(name: string): string | undefined {
        return this.currentState === GameState.WAIT ? this.users.banUser(name) : undefined;
    }

    canRejoin(userId: string): boolean {
        return this.users.canRejoin(userId);
    }

    getChoice(userId: string): boolean[] {
        return this.users.getChoice(userId);
    }

    getQrlAnswers(): QrlAnswer[] {
        return this.users.getQrlAnswers();
    }

    getScore(userId: string): Score {
        return this.users.getScore(userId);
    }

    getUser(userId: string): UserData {
        return this.users.getUser(userId);
    }

    handleChoice(userId: string, choice: boolean[]): void {
        if (this.state !== GameState.ASKING_QUESTION_QCM) return;
        this.users.handleChoice(userId, choice);
        this.sendUserSelectedChoice();
    }

    handleAnswers(userId: string, answers: QrlAnswer[]): void {
        if (this.currentState !== GameState.WAITING_FOR_ANSWERS || this.users.hostId !== userId) return;
        this.users.handleAnswers(answers, this.game.currentQuestionWithAnswer.points);
        this.showResult();
    }

    handleQrlAnswer(userId: string, answer: string): void {
        if (this.currentState !== GameState.ASKING_QUESTION_QRL) return;
        this.users.handleAnswer(userId, answer);
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
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
        if (this.state === GameState.WAIT) {
            this.users.removeUser(userId);
        }
        if (this.users.allHaveValidated && (this.state === GameState.ASKING_QUESTION_QCM || this.state === GameState.ASKING_QUESTION_QRL)) {
            this.timer.stop();
        }
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
        if (this.state === GameState.ASKING_QUESTION_QRL) this.sendUserSelectedChoice();
    }

    sendUserSelectedChoice(): void {
        this.histogramData.histogram[this.game.questionIndex] = this.users.getCurrentHistogramData(this.game.currentQuestionWithAnswer);
        this.gameGateway.sendHistogramDataUpdate(this.users.hostId, this.histogramData);
    }

    showFinalResults(): void {
        this.gameGateway.sendUsersStatUpdate(this.roomId, this.users.usersStat);
        this.gameGateway.sendHistogramDataUpdate(this.roomId, this.histogramData);
        this.advanceState(GameState.SHOW_FINAL_RESULTS);
        this.users.resetFinalResults();
    }

    setChat(hostId: string, username: string, value: boolean): string | undefined {
        return this.users.setChat(hostId, username, value);
    }

    canChat(userId: string): boolean {
        return this.users.canChat(userId);
    }

    update(userId: string, newId: string): void {
        const isHost = this.users.update(userId, newId);
        this.timer.init(newId);
        if (isHost || this.currentState === GameState.SHOW_FINAL_RESULTS) {
            this.gameGateway.sendUsersStatUpdate(newId, this.users.usersStat);
            this.gameGateway.sendHistogramDataUpdate(newId, this.histogramData);
            if (this.currentState === GameState.WAITING_FOR_ANSWERS) {
                this.gameGateway.sendQrlResultData(this.users.hostId, this.users.getQrlAnswers());
            }
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
        this.users = new Users(this.gameGateway, false, this.sendUserSelectedChoice.bind(this));
        this.roomId = '';
        this.isActive = false;
        this.timer.stop();
    }

    startPanicking(): void {
        if (
            (this.state !== GameState.ASKING_QUESTION_QCM && this.state !== GameState.ASKING_QUESTION_QRL) ||
            (this.game.currentQuestionWithAnswer.type === QuestionType.QCM && this.timer.seconds <= MIN_TIME_PANIC_QCM_S) ||
            (this.game.currentQuestionWithAnswer.type === QuestionType.QRL && this.timer.seconds <= MIN_TIME_PANIC_QRL_S)
        ) {
            return;
        }
        this.timer.panic = true;
    }

    togglePause(): void {
        if (this.state !== GameState.ASKING_QUESTION_QCM && this.state !== GameState.ASKING_QUESTION_QRL) {
            return;
        }
        this.timer.toggle();
    }

    async advance(): Promise<void> {
        switch (this.state) {
            case GameState.WAIT:
                if (!this.isLocked) return;
                this.launchGame();
                break;
            case GameState.SHOW_RESULTS:
                if (this.game.questionIndex < this.game.questions.length) {
                    await this.timer.start(TIME_CONFIRM_S);
                    this.game.addIndexCurrentQuestion();
                    this.askQuestion();
                } else {
                    this.advanceState(GameState.SHOW_FINAL_RESULTS);
                }
                break;
            default:
                break;
        }
    }

    async askQuestion(): Promise<void> {
        if (!this.isActive) return;
        this.users.resetAnswers();
        this.gameGateway.sendQrlGradedAnswer(this.roomId, Grade.Ungraded);
        this.histogramData.indexCurrentQuestion = this.game.questionIndex;
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
        this.sendUserSelectedChoice();
        if (this.game.currentQuestionWithoutAnswer.type === QuestionType.QCM) {
            this.advanceState(GameState.ASKING_QUESTION_QCM);
            await this.timer.start(this.game.duration);
        } else if (this.game.currentQuestionWithoutAnswer.type === QuestionType.QRL) {
            this.advanceState(GameState.ASKING_QUESTION_QRL);
            await this.timer.start(QRL_TIME);
        }
        if (!this.isActive) return;

        if (this.game.currentQuestionWithAnswer.type === QuestionType.QCM) {
            const correctAnswers = this.game.currentQuestionWithAnswer.choices.map((choice) => choice.isCorrect);
            this.users.updateUsersScore(correctAnswers, this.game.questions[this.game.questionIndex].points);
            this.showResult();
        } else {
            if (this.roomId.startsWith('test')) {
                this.users.handleTestAnswer(this.game.currentQuestionWithoutAnswer.points);
                this.showResult();
                return;
            }
            this.advanceState(GameState.WAITING_FOR_ANSWERS);
            this.gameGateway.sendQrlResultData(this.users.hostId, this.users.getQrlAnswers());
        }
    }

    async showResult(): Promise<void> {
        this.advanceState(GameState.SHOW_RESULTS);
        this.gameGateway.sendUsersStatUpdate(this.users.hostId, this.users.usersStat);
        if (this.game.questionIndex + 1 === this.game.questions.length) {
            this.advanceState(GameState.LAST_QUESTION);
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
            this.game.addIndexCurrentQuestion();
            this.askQuestion();
        }
    }

    async launchGame(): Promise<void> {
        this.advanceState(GameState.STARTING);
        await this.timer.start(WAITING_TIME_S);
        this.askQuestion();
    }

    private advanceState(state: GameState): void {
        this.state = state;
        this.gameGateway.sendStateUpdate(this.roomId, this.gameStatePayload);
    }
}
