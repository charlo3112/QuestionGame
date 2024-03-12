import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameState } from '@common/enums/game-state';
import { Game } from '@common/interfaces/game';
import { Question } from '@common/interfaces/question';
import { TimeService } from './time.service';

const timeConfirmMs = 3000;
const bonusMultiplier = 1.2;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private game: Game;
    private i: number = 0;
    private state: GameState = GameState.NotStarted;
    private scoreValue: number = 0;
    private bonus: boolean = false;
    private choicesSelected: boolean[] = [false, false, false, false];

    constructor(
        private readonly timeService: TimeService,
        private readonly router: Router,
    ) {}

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
                return this.game.questions[this.i];
            case GameState.ShowResults:
                return this.game.questions[this.i];
            default:
                return undefined;
        }
    }

    get message(): string | undefined {
        if (this.state !== GameState.ShowResults || !this.bonus || !this.isResponseGood()) return undefined;
        return 'Vous avez un bonus!';
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
        this.askQuestion();
    }

    confirmQuestion() {
        if (this.state !== GameState.AskingQuestion) {
            return;
        }
        this.advanceState();
        this.timeService.stopTimer();
        this.scoreValue += this.scoreQuestion();
        this.timeService.setTimeout(() => {
            this.advanceState();
            if (this.state === GameState.GameOver) {
                this.router.navigate(['#/admin/game']);
                return;
            }
            this.askQuestion();
        }, timeConfirmMs);
    }

    toggleBonus() {
        this.bonus = !this.bonus;
    }

    private askQuestion() {
        this.timeService.startTimer(this.game.duration, () => {
            this.confirmQuestion();
        });
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

    private scoreQuestion(): number {
        if (this.isResponseGood()) {
            const questionValue = this.game.questions[this.i].points;
            return this.bonus ? questionValue * bonusMultiplier : questionValue;
        }
        return 0;
    }

    private advanceState() {
        switch (this.state) {
            case GameState.AskingQuestion:
                this.state = GameState.ShowResults;
                break;
            case GameState.ShowResults:
                for (let i = 0; i < this.game.questions[this.i].choices.length; ++i) this.choicesSelected[i] = false;
                this.state = ++this.i < this.game.questions.length ? GameState.AskingQuestion : GameState.GameOver;
                break;
            case GameState.GameOver:
                this.state = GameState.GameOver;
                break;
        }
    }
}
