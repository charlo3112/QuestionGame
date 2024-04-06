import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SortOption } from '@app/enums/sort-option';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { PanicService } from '@app/services/panic/panic.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME, SNACKBAR_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { Game } from '@common/interfaces/game';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Question } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';
import { UserStat } from '@common/interfaces/user-stat';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class GameService {
    // eslint-disable-next-line max-params
    constructor(
        private readonly websocketService: WebSocketService,
        private readonly communicationService: CommunicationService,
        private readonly sessionStorageService: SessionStorageService,
        private readonly gameSubscriptionService: GameSubscriptionService,
        private readonly panicService: PanicService,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
    ) {
        this.panicService.setAudio();
    }

    get gameTitle(): string {
        return this.gameSubscriptionService.title;
    }

    get score(): number {
        return this.gameSubscriptionService.scoreValue;
    }

    get isPlaying(): boolean {
        return this.sessionStorageService.play;
    }

    get time(): number {
        return this.gameSubscriptionService.serverTime;
    }

    get isValidationDisabled(): boolean {
        return this.gameSubscriptionService.isValidate;
    }

    get maxTime(): number {
        const twenty = 20;
        return twenty;
    }

    get usersStat(): UserStat[] {
        return this.gameSubscriptionService.usersStat;
    }

    get currentState(): GameState {
        return this.gameSubscriptionService.state;
    }

    get currentQuestion(): Question | undefined {
        if (
            this.gameSubscriptionService.state !== GameState.AskingQuestion &&
            this.gameSubscriptionService.state !== GameState.ShowResults &&
            this.gameSubscriptionService.state !== GameState.LastQuestion
        )
            return undefined;
        return this.gameSubscriptionService.question;
    }

    get message(): string | undefined {
        if (this.gameSubscriptionService.state !== GameState.ShowResults || !this.isResponseGood() || !this.gameSubscriptionService.showBonus)
            return undefined;
        return 'Vous avez un bonus!';
    }

    get histogram(): HistogramData {
        return this.gameSubscriptionService.histogramData;
    }

    get usernameValue(): string {
        return this.sessionStorageService.username;
    }

    get roomCodeValue(): string {
        return this.sessionStorageService.roomId;
    }

    get isHost(): boolean {
        if (this.sessionStorageService.username === HOST_NAME) {
            return true;
        }
        return false;
    }

    get playersList(): Set<string> {
        return this.gameSubscriptionService.players;
    }

    get sortOption(): SortOption {
        return this.gameSubscriptionService.sortOption;
    }

    set sortOption(option: SortOption) {
        this.gameSubscriptionService.sortOption = option;
        this.gameSubscriptionService.sortUsers();
    }

    async getQrlAnswers(): Promise<QrlAnswer[]> {
        return await this.websocketService.getQrlAnswers();
    }

    setChat(username: string, value: boolean): void {
        this.websocketService.setChat(username, value);
    }

    async init() {
        const res = await this.sessionStorageService.initUser();
        if (!res.ok) {
            return;
        }

        await this.gameSubscriptionService.initSubscriptions(res.value);
    }

    reset() {
        this.gameSubscriptionService.reset();
    }

    onKickPlayer(player: string) {
        this.gameSubscriptionService.players.delete(player);
        this.websocketService.banUser(player);
    }

    sendGrades(answers: QrlAnswer[]) {
        this.websocketService.sendAnswers(answers);
    }

    leaveRoom() {
        if (this.gameSubscriptionService.state !== GameState.Starting) {
            this.websocketService.leaveRoom();
            this.sessionStorageService.removeUser();
            this.gameSubscriptionService.reset();
        }
    }

    isChoiceSelected(index: number): boolean {
        return this.gameSubscriptionService.choicesSelected[index];
    }

    isChoiceCorrect(index: number): boolean {
        if (this.gameSubscriptionService.state !== GameState.ShowResults && this.gameSubscriptionService.state !== GameState.LastQuestion) {
            return false;
        }
        if (this.gameSubscriptionService.question === undefined) {
            return false;
        }
        const choice = this.gameSubscriptionService.question.choices[index];
        return choice.isCorrect as boolean;
    }

    isChoiceIncorrect(index: number): boolean {
        if (this.gameSubscriptionService.state !== GameState.ShowResults && this.gameSubscriptionService.state !== GameState.LastQuestion) {
            return false;
        }
        if (this.gameSubscriptionService.question === undefined) {
            return false;
        }
        const choice = this.gameSubscriptionService.question.choices[index];
        return !choice.isCorrect;
    }

    selectChoice(index: number) {
        if (this.gameSubscriptionService.state === GameState.AskingQuestion && !this.isValidationDisabled) {
            this.gameSubscriptionService.choicesSelected[index] = !this.gameSubscriptionService.choicesSelected[index];
            this.websocketService.sendChoice(this.gameSubscriptionService.choicesSelected);
        }
    }

    confirmQuestion() {
        if (this.gameSubscriptionService.state === GameState.AskingQuestion) {
            this.websocketService.validateChoice();
        }
    }

    sendQrlAnswer(answer: string) {
        const qrlAnswer: QrlAnswer = {
            text: answer,
            player: this.sessionStorageService.username,
            grade: Grade.Ungraded,
        };
        this.websocketService.sendQrlAnswer(qrlAnswer);
    }

    nextQuestion() {
        this.websocketService.hostConfirm();
    }

    showFinalResults() {
        this.websocketService.showFinalResults();
    }

    timerSubscribe(): Observable<number> {
        return this.websocketService.getTime();
    }

    stateSubscribe(): Observable<GameStatePayload> {
        return this.websocketService.getState();
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
        if (this.gameSubscriptionService.question === undefined) {
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
