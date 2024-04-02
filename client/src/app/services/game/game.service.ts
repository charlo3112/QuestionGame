import { Injectable } from '@angular/core';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Question } from '@common/interfaces/question';
import { UserStat } from '@common/interfaces/user-stat';
import { Observable } from 'rxjs';

@Injectable()
export class GameService {
    constructor(
        private readonly websocketService: WebSocketService,
        private readonly sessionStorageService: SessionStorageService,
        private readonly gameSubscriptionService: GameSubscriptionService,
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

    get time(): number {
        return this.gameSubscriptionService.serverTime;
    }

    get maxTime(): number {
        const twenty = 20;
        return twenty;
    }

    get usersStatValue(): UserStat[] {
        return this.gameSubscriptionService.usersStat;
    }

    get currentState(): GameState {
        return this.gameSubscriptionService.state;
    }

    get currentQuestion(): Question | undefined {
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
        if (this.gameSubscriptionService.state === GameState.AskingQuestion) {
            this.gameSubscriptionService.choicesSelected[index] = !this.gameSubscriptionService.choicesSelected[index];
            this.websocketService.sendChoice(this.gameSubscriptionService.choicesSelected);
        }
    }

    confirmQuestion() {
        if (this.gameSubscriptionService.state === GameState.AskingQuestion) {
            this.websocketService.validateChoice();
        }
        this.gameSubscriptionService.state = GameState.WaitingResults;
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
