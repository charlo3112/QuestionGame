import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TimeService } from '@app/services/time.service';
import { WebSocketService } from '@app/services/websocket.service';
import { GameState } from '@common/enums/game-state';
import { Game } from '@common/interfaces/game';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Question } from '@common/interfaces/question';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService implements OnDestroy {
    game: Game;
    private i: number = 0;
    private state: GameState = GameState.NotStarted;
    private scoreValue: number = 0;
    private choicesSelected: boolean[] = [false, false, false, false];
    private stateSubscription: Subscription;

    constructor(
        private readonly timeService: TimeService,
        private readonly websocketService: WebSocketService,
        private readonly routerService: Router,
    ) {
        this.subscribeToStateUpdate();
    }

    get score(): number {
        return this.scoreValue;
    }

    get time(): number {
        return this.timeService.time;
    }

    get maxTime(): number {
        return this.game.duration;
    }

    get currentState(): GameState {
        return this.state;
    }

    get currentQuestion(): Question | undefined {
        switch (this.state) {
            case GameState.AskingQuestion:
            case GameState.WaitingResults:
            case GameState.ShowResults:
                return this.game.questions[this.i];
            default:
                return undefined;
        }
    }

    get message(): string | undefined {
        if (this.state !== GameState.ShowResults || !this.isResponseGood()) return undefined;
        return 'Vous avez un bonus!';
    }

    ngOnDestroy(): void {
        this.stateSubscription.unsubscribe();
    }

    reset(): void {
        this.i = 0;
        this.state = GameState.NotStarted;
        this.scoreValue = 0;
        this.choicesSelected = [false, false, false, false];
        this.timeService.stopTimer();
    }

    isChoiceSelected(index: number): boolean {
        return this.choicesSelected[index];
    }

    isChoiceCorrect(index: number): boolean {
        if (this.state !== GameState.ShowResults) {
            return false;
        }
        const choice = this.game.questions[this.i].choices[index];
        return choice.isCorrect as boolean;
    }

    isChoiceIncorrect(index: number): boolean {
        if (this.state !== GameState.ShowResults) {
            return false;
        }
        const choice = this.game.questions[this.i].choices[index];
        return !choice.isCorrect;
    }

    selectChoice(index: number) {
        if (this.state === GameState.AskingQuestion) {
            this.choicesSelected[index] = !this.choicesSelected[index];
        }
    }

    startGame(newGame: Game) {
        this.game = newGame;
        this.i = 0;
        this.scoreValue = 0;
        this.timeService.stopTimer();
        this.state = GameState.AskingQuestion;
    }

    confirmQuestion() {
        if (this.state !== GameState.AskingQuestion) {
            return;
        }
        this.state = GameState.WaitingResults;
    }

    private askQuestion() {
        this.timeService.startTimer(this.game.duration);
    }

    private isResponseGood(): boolean {
        const length = this.game.questions[this.i].choices.length;
        for (let i = 0; i < length; ++i) {
            if (this.choicesSelected[i] !== this.game.questions[this.i].choices[i].isCorrect) {
                return false;
            }
        }
        return true;
    }

    private subscribeToStateUpdate() {
        this.stateSubscription = this.websocketService.getState().subscribe({
            next: (state: GameStatePayload) => {
                const nextState = state.state;
                console.log(state);
                console.log(nextState);
                if (this.state === GameState.Starting) {
                    this.startGame(state.payload as Game);
                    this.routerService.navigate(['/game']);
                }
                if (this.state === GameState.ShowResults && nextState === GameState.AskingQuestion) {
                    ++this.i;
                    this.choicesSelected = [false, false, false, false];
                }
                if (nextState === GameState.AskingQuestion) {
                    this.askQuestion();
                }

                this.state = nextState;
            },
        });
    }
}
