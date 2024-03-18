import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '@app/services/game.service';
import { Choice } from '@common/interfaces/choice';
import { Question } from '@common/interfaces/question';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
    imports: [MatIconModule, CommonModule, MatButtonModule, MatCardModule],
    standalone: true,
})
export class HistogramComponent {
    @Input() showArrows: boolean = true;
    listQuestions: Question[];
    indexQuestionDisplayed: number = 0;
    questionsCounters: number[][];
    private stateSubscription: Subscription;

    constructor(public gameService: GameService) {
        this.subscribeToQuestionUpdates();
    }

    subscribeToQuestionUpdates() {
        this.stateSubscription = this.gameService.stateSubscribe().subscribe({
            next: () => {
                const currentQuestion = this.gameService.currentQuestion;
                if (currentQuestion && !this.questionExists(currentQuestion)) {
                    this.listQuestions.push(currentQuestion);
                    this.indexQuestionDisplayed = this.listQuestions.length - 1;
                }
            },
        });
    }

    questionExists(question: Question): boolean {
        return this.listQuestions.some((q) => q.text === question.text);
    }

    ngOnDestroy() {
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
        }
    }

    previousQuestion() {
        if (this.indexQuestionDisplayed !== 0) {
            this.indexQuestionDisplayed--;
        } else {
            this.indexQuestionDisplayed = this.listQuestions.length - 1;
        }
    }

    nextQuestion() {
        if (this.indexQuestionDisplayed !== this.listQuestions.length - 1) {
            this.indexQuestionDisplayed++;
        } else {
            this.indexQuestionDisplayed = 0;
        }
    }

    getMaxCounter(): number {
        let max = 0;
        for (let i = 0; i < this.listQuestions[this.indexQuestionDisplayed].choices.length; i++) {
            if (this.questionsCounters[this.indexQuestionDisplayed][i] > max) {
                max = this.questionsCounters[this.indexQuestionDisplayed][i];
            }
        }
        return max;
    }

    getChoiceIndex(choice: Choice): number {
        return this.listQuestions[this.indexQuestionDisplayed].choices.indexOf(choice);
    }

    setDisplayedQuestionCounters(tab: number[]) {
        this.questionsCounters[this.indexQuestionDisplayed] = tab;
    }

    getCounter(choice: Choice): number {
        return this.questionsCounters[this.indexQuestionDisplayed][this.getChoiceIndex(choice)];
    }
}
