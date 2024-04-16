import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { TimeService } from '@app/services/time/time.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME, SNACKBAR_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { SortOption } from '@common/enums/sort-option';
import { Game } from '@common/interfaces/game';
import { HistogramData } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Question } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';
import { UserStat } from '@common/interfaces/user-stat';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GameService {
    // eslint-disable-next-line max-params
    constructor(
        private readonly websocketService: WebSocketService,
        private readonly communicationService: CommunicationService,
        private readonly sessionStorageService: SessionStorageService,
        private readonly gameSubscriptionService: GameSubscriptionService,
        private readonly timeService: TimeService,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
    ) {}

    get gameTitle(): string {
        return this.gameSubscriptionService.title;
    }
    get score(): number {
        return this.gameSubscriptionService.scoreValue;
    }

    get isPlaying(): boolean {
        return this.sessionStorageService.play;
    }

    get isTest(): boolean {
        return this.sessionStorageService.test;
    }

    get time(): number {
        return this.timeService.serverTime;
    }

    get isValidationDisabled(): boolean {
        return this.gameSubscriptionService.isValidate;
    }

    get panic(): boolean {
        return this.timeService.panicMode;
    }

    get pause(): boolean {
        return this.timeService.pause;
    }

    get maxTime(): number {
        return this.timeService.maxTime;
    }

    get usersStat(): UserStat[] {
        return this.gameSubscriptionService.usersStat;
    }

    get currentState(): GameState {
        return this.gameSubscriptionService.state;
    }

    get qrlAnswers(): QrlAnswer[] {
        return this.gameSubscriptionService.qrlAnswers;
    }

    get currentQuestion(): Question | undefined {
        if (
            this.gameSubscriptionService.state !== GameState.ASKING_QUESTION_QCM &&
            this.gameSubscriptionService.state !== GameState.ASKING_QUESTION_QRL &&
            this.gameSubscriptionService.state !== GameState.WAITING_FOR_ANSWERS &&
            this.gameSubscriptionService.state !== GameState.SHOW_RESULTS &&
            this.gameSubscriptionService.state !== GameState.LAST_QUESTION
        )
            return undefined;
        return this.gameSubscriptionService.question;
    }

    get firework(): boolean {
        return !(
            (this.gameSubscriptionService.state !== GameState.SHOW_RESULTS && this.gameSubscriptionService.state !== GameState.LAST_QUESTION) ||
            !this.isResponseGood() ||
            !this.gameSubscriptionService.showBonus
        );
    }

    get message(): string | undefined {
        return (this.gameSubscriptionService.state !== GameState.SHOW_RESULTS && this.gameSubscriptionService.state !== GameState.LAST_QUESTION) ||
            !this.isResponseGood() ||
            !this.gameSubscriptionService.showBonus
            ? undefined
            : 'Vous avez un bonus!';
    }

    get histogram(): HistogramData | undefined {
        return this.gameSubscriptionService.histogramData;
    }

    get usernameValue(): string {
        return this.sessionStorageService.username;
    }

    get qrlAnswer(): string {
        return this.gameSubscriptionService.answer;
    }

    get grade(): Grade {
        if (this.roomCodeValue.startsWith('test')) {
            return Grade.One;
        }
        return this.gameSubscriptionService.qrlGradedAnswer;
    }

    get roomCodeValue(): string {
        return this.sessionStorageService.roomId;
    }

    get isHost(): boolean {
        return this.sessionStorageService.username === HOST_NAME;
    }

    get usersList(): Set<string> {
        return this.gameSubscriptionService.users;
    }

    get sortOption(): SortOption {
        return this.gameSubscriptionService.sortOption;
    }

    set qrlAnswer(qrlAnswer: string) {
        this.gameSubscriptionService.answer = qrlAnswer;
    }

    set sortOption(option: SortOption) {
        this.gameSubscriptionService.sortOption = option;
        this.gameSubscriptionService.sortUsers();
    }

    setChat(username: string, value: boolean): void {
        this.websocketService.setChat(username, value);
    }

    togglePause(): void {
        this.websocketService.togglePause();
    }

    startPanic(): void {
        this.websocketService.startPanicking();
    }

    async init(): Promise<void> {
        const res = await this.sessionStorageService.initUser();
        if (!res.ok) return;

        await this.gameSubscriptionService.initSubscriptions(res.value);
    }

    reset(): void {
        this.gameSubscriptionService.reset();
        this.timeService.reset();
    }

    onKickPlayer(player: string): void {
        this.gameSubscriptionService.users.delete(player);
        this.websocketService.banUser(player);
    }

    sendGrades(answers: QrlAnswer[]): void {
        this.websocketService.sendAnswers(answers);
    }

    leaveRoom(): void {
        if (this.gameSubscriptionService.state !== GameState.STARTING) {
            this.websocketService.leaveRoom();
            this.sessionStorageService.removeUser();
            this.gameSubscriptionService.reset();
        }
    }

    isChoiceSelected(index: number): boolean {
        return this.gameSubscriptionService.choicesSelected[index];
    }

    isChoiceCorrect(index: number): boolean {
        if (this.gameSubscriptionService.state !== GameState.SHOW_RESULTS && this.gameSubscriptionService.state !== GameState.LAST_QUESTION) {
            return false;
        }
        if (this.gameSubscriptionService.question === undefined || this.gameSubscriptionService.question.type !== QuestionType.QCM) {
            return false;
        }
        const choice = this.gameSubscriptionService.question.choices[index];
        return choice.isCorrect as boolean;
    }

    isChoiceIncorrect(index: number): boolean {
        if (this.gameSubscriptionService.state !== GameState.SHOW_RESULTS && this.gameSubscriptionService.state !== GameState.LAST_QUESTION) {
            return false;
        }
        if (this.gameSubscriptionService.question === undefined || this.gameSubscriptionService.question.type !== QuestionType.QCM) {
            return false;
        }
        const choice = this.gameSubscriptionService.question.choices[index];
        return !choice.isCorrect;
    }

    selectChoice(index: number): void {
        if (this.gameSubscriptionService.state === GameState.ASKING_QUESTION_QCM && !this.isValidationDisabled) {
            this.gameSubscriptionService.choicesSelected[index] = !this.gameSubscriptionService.choicesSelected[index];
            this.websocketService.sendChoice(this.gameSubscriptionService.choicesSelected);
        }
    }

    confirmQuestion(): void {
        if (
            this.gameSubscriptionService.state === GameState.ASKING_QUESTION_QCM ||
            this.gameSubscriptionService.state === GameState.ASKING_QUESTION_QRL
        ) {
            this.websocketService.validateChoice();
        }
    }

    sendQrlAnswer(answer: string): void {
        this.websocketService.sendQrlAnswer(answer);
    }

    nextQuestion(): void {
        this.websocketService.hostConfirm();
    }

    showFinalResults(): void {
        this.websocketService.showFinalResults();
    }

    async startGame(game: Game): Promise<boolean> {
        const gameId = game.gameId;
        const GAME_DELETED = 'Jeux supprimé, veuillez en choisir un autre';
        const GAME_INVISIBLE = 'Jeux invisible, veuillez en choisir un autre';

        try {
            const result: Result<Game> = await firstValueFrom(this.communicationService.getGameByID(gameId));

            if (!result.ok || !result.value) {
                this.snackBar.open(GAME_DELETED, undefined, { duration: SNACKBAR_DURATION });
                return false;
            }
            const newGame = result.value;
            const user = await this.websocketService.createRoom(newGame.gameId);
            if (!user) {
                this.snackBar.open(GAME_INVISIBLE, undefined, { duration: SNACKBAR_DURATION });
                return false;
            }
            this.sessionStorageService.user = user;
            this.sessionStorageService.test = false;
            this.router.navigate(['/loading']);
        } catch (error) {
            this.snackBar.open(GAME_DELETED, undefined, { duration: SNACKBAR_DURATION });
            return false;
        }
        return true;
    }

    async startRandomGame(): Promise<boolean> {
        const user = await this.websocketService.startRandom();
        if (user) {
            this.sessionStorageService.user = user;
            this.sessionStorageService.test = false;
            this.router.navigate(['/loading']);
            return true;
        }
        this.snackBar.open('Impossible de créer un jeu aléatoire', undefined, { duration: SNACKBAR_DURATION });
        return false;
    }

    async testGame(game: Game): Promise<boolean> {
        const gameId = game.gameId;
        const GAME_DELETED = 'Jeux supprimé, veuillez en choisir un autre';
        const GAME_INVISIBLE = 'Jeux invisible, veuillez en choisir un autre';

        try {
            const result: Result<Game> = await firstValueFrom(this.communicationService.getGameByID(gameId));

            if (!result.ok || !result.value) {
                this.snackBar.open(GAME_DELETED, undefined, { duration: SNACKBAR_DURATION });
                return false;
            }
            const newGame = result.value;
            const user = await this.websocketService.testGame(newGame.gameId);
            if (!user) {
                this.snackBar.open(GAME_INVISIBLE, undefined, { duration: SNACKBAR_DURATION });
                return false;
            }
            this.sessionStorageService.user = user;
            this.sessionStorageService.test = true;
            this.websocketService.startTest();
            this.router.navigate(['/game']);
        } catch (error) {
            this.snackBar.open(GAME_DELETED, undefined, { duration: SNACKBAR_DURATION });
            return false;
        }
        return true;
    }

    private isResponseGood(): boolean {
        if (this.gameSubscriptionService.question === undefined || this.gameSubscriptionService.question.type !== QuestionType.QCM) {
            return false;
        }

        const length = this.gameSubscriptionService.question.choices.length;
        for (let i = 0; i < length; ++i) {
            if (this.gameSubscriptionService.choicesSelected[i] !== this.gameSubscriptionService.question.choices[i].isCorrect) {
                return false;
            }
        }
        return true;
    }
}
