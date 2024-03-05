import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Choice, ChoiceWithCounter } from '@app/classes/choice';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
    imports: [MatIconModule, CommonModule, MatButtonModule, MatCardModule],
    standalone: true,
})
export class HistogramComponent {
    @Input() listQuestions: Question[];
    questionDisplayed: number = 0;

    isChoiceWithCounter(choice: Choice): choice is ChoiceWithCounter {
        return (choice as ChoiceWithCounter).counter !== undefined;
    }
    previousQuestion() {
        if (this.questionDisplayed !== 0) {
            this.questionDisplayed--;
        } else {
            this.questionDisplayed = this.listQuestions.length - 1;
        }
    }
    nextQuestion() {
        if (this.questionDisplayed !== this.listQuestions.length - 1) {
            this.questionDisplayed++;
        } else {
            this.questionDisplayed = 0;
        }
    }
    getMaxCounter(): number {
        const question = this.listQuestions[this.questionDisplayed];
        let counters: number[] = [];
        for (let choice of question.choices) {
            if (this.isChoiceWithCounter(choice)) {
                counters.push(choice.counter);
            }
        }
        if (counters.length > 0) {
            return Math.max(...counters);
        } else {
            return 0;
        }
    }
}
