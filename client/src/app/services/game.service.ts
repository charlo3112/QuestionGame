import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { TimeService } from './time.service';
import { GameState } from '@app/enums/game-state';
import { Router } from '@angular/router';

const timeConfirmMs = 3000;
const timeQuestionS = 60;
const questionValue = 10;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private questions: Question[] = [];
    private i: number = 0;
    private state: GameState = GameState.NotStarted;
    private score: number = 0;

    constructor(
        private readonly timeService: TimeService,
        private readonly router: Router,
    ) {}

    get scoreValue(): number {
        return this.score;
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
        this.score = 0;
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
        this.state = GameState.ShowResults;
        this.timeService.stopTimer();
        this.score += this.scoreQuestion();

        this.timeService.setTimeout(() => {
            this.advanceState();
            if (this.state === GameState.Gameover) {
                this.router.navigate(['#/admin/game']);
                return;
            }
            this.askQuestion();
        }, timeConfirmMs);
    }

    private askQuestion() {
        this.timeService.startTimer(timeQuestionS, () => {
            this.confirmQuestion();
        });
    }

    private scoreQuestion(): number {
        if (this.questions[this.i].choices.filter((c) => c.isCorrect === c.isSelected).length === this.questions[this.i].choices.length) {
            return questionValue;
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
