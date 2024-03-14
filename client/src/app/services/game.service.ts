import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WebSocketService } from '@app/services/websocket.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Question } from '@common/interfaces/question';
import { User } from '@common/interfaces/user';
import { Subscription } from 'rxjs';

@Injectable()
export class GameService implements OnDestroy {
    private state: GameState = GameState.NotStarted;
    private question: Question | undefined = undefined;
    private scoreValue: number = 0;
    private choicesSelected: boolean[] = [false, false, false, false];
    private username: string = '';
    private roomCode: string = '';
    private stateSubscription: Subscription;
    private messagesSubscription: Subscription;
    private timeSubscription: Subscription;
    private scoreSubscription: Subscription;
    private serverTime: number;
    private title: string;

    constructor(
        private readonly websocketService: WebSocketService,
        private readonly snackBarService: MatSnackBar,
        private readonly routerService: Router,
    ) {
        this.subscribeToStateUpdate();
        this.subscribeToClosedConnection();
        this.subscribeToTimeUpdate();
        this.subscribeToScoreUpdate();

        if (this.routerService.url !== '/game' && this.routerService.url !== '/loading') {
            this.websocketService.leaveRoom();
        }
    }

    get gameTitle(): string {
        return this.title;
    }

    get score(): number {
        return this.scoreValue;
    }

    get time(): number {
        return this.serverTime;
    }

    get maxTime(): number {
        const twenty = 20;
        return twenty;
    }

    get currentState(): GameState {
        return this.state;
    }

    get currentQuestion(): Question | undefined {
        return this.question;
    }

    get message(): string | undefined {
        if (this.state !== GameState.ShowResults || !this.isResponseGood()) return undefined;
        return 'Vous avez un bonus!';
    }

    get usernameValue(): string {
        return this.username;
    }

    get roomCodeValue(): string {
        return this.roomCode;
    }

    get isHost(): boolean {
        if (this.username.toLowerCase() === 'organisateur') {
            return true;
        }
        return false;
    }

    async init() {
        const data = sessionStorage.getItem('user');
        if (!data) {
            this.routerService.navigate(['/']);
        } else {
            const user: User = JSON.parse(data);
            const res = await this.websocketService.rejoinRoom(user);

            if (!res.ok) {
                sessionStorage.removeItem('user');
                this.snackBarService.open(res.error, undefined, { duration: SNACKBAR_DURATION });
                this.routerService.navigate(['/']);
                return;
            }
            sessionStorage.setItem('user', JSON.stringify({ ...user, userId: this.websocketService.id }));

            this.username = user.name;
            this.roomCode = user.roomId;
            this.setState(res.value);
            // this.scoreValue = await this.websocketService.getScore();

            if (this.state === GameState.AskingQuestion) {
                this.choicesSelected = await this.websocketService.getChoice();
                if (await this.websocketService.isValidate()) {
                    this.state = GameState.WaitingResults;
                }
            }
        }
    }

    ngOnDestroy() {
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
        }
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
        if (this.timeSubscription) {
            this.timeSubscription.unsubscribe();
        }
        if (this.scoreSubscription) {
            this.scoreSubscription.unsubscribe();
        }
    }

    leaveRoom() {
        if (this.state !== GameState.Starting) {
            this.websocketService.leaveRoom();
            sessionStorage.removeItem('user');
            this.reset();
        }
    }

    reset() {
        this.question = undefined;
        this.state = GameState.NotStarted;
        this.scoreValue = 0;
        this.choicesSelected = [false, false, false, false];
    }

    isChoiceSelected(index: number): boolean {
        return this.choicesSelected[index];
    }

    isChoiceCorrect(index: number): boolean {
        if (this.state !== GameState.ShowResults) {
            return false;
        }
        if (this.question === undefined) {
            return false;
        }
        const choice = this.question.choices[index];
        return choice.isCorrect as boolean;
    }

    isChoiceIncorrect(index: number): boolean {
        if (this.state !== GameState.ShowResults) {
            return false;
        }
        if (this.question === undefined) {
            return false;
        }
        const choice = this.question.choices[index];
        return !choice.isCorrect;
    }

    selectChoice(index: number) {
        if (this.state === GameState.AskingQuestion) {
            this.choicesSelected[index] = !this.choicesSelected[index];
            this.websocketService.sendChoice(this.choicesSelected);
        }
    }

    confirmQuestion() {
        if (this.state !== GameState.AskingQuestion) {
            this.websocketService.validateChoice();
            return;
        }
        this.state = GameState.WaitingResults;
    }

    private askQuestion() {
        // this.timeService.startTimer(this.game.duration);
    }

    private isResponseGood(): boolean {
        if (this.question === undefined) {
            return false;
        }

        const length = this.question.choices.length;
        for (let i = 0; i < length; ++i) {
            if (this.choicesSelected[i] !== this.question.choices[i].isCorrect) {
                return false;
            }
        }
        return true;
    }

    private subscribeToClosedConnection() {
        this.messagesSubscription = this.websocketService.getClosedConnection().subscribe({
            next: (message: string) => {
                this.snackBarService.open(message, undefined, { duration: SNACKBAR_DURATION });
                this.routerService.navigate(['/']);
            },
        });
    }

    private subscribeToStateUpdate() {
        this.stateSubscription = this.websocketService.getState().subscribe({
            next: (state: GameStatePayload) => {
                this.setState(state);
            },
        });
    }

    private subscribeToTimeUpdate() {
        this.timeSubscription = this.websocketService.getTime().subscribe({
            next: (time: number) => {
                this.serverTime = time;
            },
        });
    }

    private subscribeToScoreUpdate() {
        this.scoreSubscription = this.websocketService.getScoreUpdate().subscribe({
            next: (score: number) => {
                this.scoreValue = score;
            },
        });
    }

    private setState(state: GameStatePayload) {
        this.state = state.state;
        if (this.state === GameState.NotStarted) {
            return;
        }
        if (this.state === GameState.GameOver) {
            return;
        }

        if (this.state === GameState.Wait) {
            if (this.routerService.url !== '/loading') {
                this.routerService.navigate(['/loading']);
            }
            return;
        }

        if (this.state === GameState.AskingQuestion) {
            this.question = state.payload as Question;
            this.choicesSelected = [false, false, false, false];
            this.askQuestion();
        }

        if (this.state === GameState.ShowResults) {
            this.question = state.payload as Question;
        }

        if (this.state === GameState.Starting) {
            this.title = state.payload as string;
        }

        if (this.routerService.url !== '/game') {
            this.routerService.navigate(['/game']);
        }
    }
}
