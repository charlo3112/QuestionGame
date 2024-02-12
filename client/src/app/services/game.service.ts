import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { TimeService } from './time.service';
import { GameState } from '@app/enums/game-state';
import { Router } from '@angular/router';

const timeConfirmMs = 3000;
const timeQuestionS = 60;
const questionValue = 10;
const bonusMultiplier = 1.2;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private questions: Question[] = [];
    private i: number = 0;
    private state: GameState = GameState.NotStarted;
    private scoreValue: number = 0;
    private bonus: boolean = false;

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

    get currentState(): GameState {
        return this.state;
    }

    get currentQuestion(): Question | undefined {
        switch (this.state) {
            case GameState.AskingQuestion:
                return this.questions[this.i];
            case GameState.ShowResults:
                return this.questions[this.i];
            default:
                return undefined;
        }
    }

    get message(): string | undefined {
        if (this.state !== GameState.ShowResults || !this.bonus || !this.isResponseGood()) return undefined;
        return 'Vous avez un bonus!';
    }

    isChoiceCorrect(index: number): boolean {
        if (this.state !== GameState.ShowResults) {
            return false;
        }
        const choice = this.questions[this.i].choices[index];
        return choice.isCorrect && choice.isSelected;
    }

    isChoiceIncorrect(index: number): boolean {
        if (this.state !== GameState.ShowResults) {
            return false;
        }
        const choice = this.questions[this.i].choices[index];
        return (!choice.isCorrect && choice.isSelected) || (choice.isCorrect && !choice.isSelected);
    }

    selectChoice(index: number) {
        if (this.state === GameState.AskingQuestion) {
            this.questions[this.i].choices[index].isSelected = !this.questions[this.i].choices[index].isSelected;
        }
    }

    startGame(newQuestions: Question[]) {
        this.questions = newQuestions;
        this.i = 0;
        this.scoreValue = 0;
        this.state = GameState.AskingQuestion;
        this.askQuestion();
    }

    getCurrent(): Question {
        return this.questions[this.i];
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
            if (this.state === GameState.Gameover) {
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
        this.timeService.startTimer(timeQuestionS, () => {
            this.confirmQuestion();
        });
    }

    private isResponseGood(): boolean {
        return this.questions[this.i].choices.filter((c) => c.isCorrect === c.isSelected).length === this.questions[this.i].choices.length;
    }

    private scoreQuestion(): number {
        if (this.isResponseGood()) {
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
                this.state = ++this.i < this.questions.length ? GameState.AskingQuestion : GameState.Gameover;
                break;
            case GameState.Gameover:
                this.state = GameState.Gameover;
                break;
        }
    }
}
