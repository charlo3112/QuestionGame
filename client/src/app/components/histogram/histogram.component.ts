import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Choice, ChoiceWithCounter } from '@app/classes/choice';
import { QuestionType } from '@common/constants';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
    imports: [MatIconModule, CommonModule, MatButtonModule, MatCardModule],
    standalone: true,
})
export class HistogramComponent {
    choix1question1 = new ChoiceWithCounter('Guillaume en boit', true, 5);
    choix2question1 = new ChoiceWithCounter('Guillaume en a apporté 2 boites', false, 3);
    choix3question1 = new ChoiceWithCounter("C'est du lichi", false, 2);
    question1: Question = {
        type: QuestionType.QCM,
        text: "Pourquoi le jus de lichi n'est pas bon?",
        points: 69,
        choices: [this.choix1question1, this.choix2question1, this.choix3question1],
    }
    choix1question2 = new ChoiceWithCounter('Les temps de compilation sont abominables', false, 1);
    choix2question2 = new ChoiceWithCounter("C'est quoi cette question?", true, 4);
    choix3question2 = new ChoiceWithCounter('Le javascript est une erreur.', true, 156);
    choix4question2 = new ChoiceWithCounter('Les deux sont horribles', false, 2);
    question2: Question = {
        type: QuestionType.QCM,
        text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
        points: 42,
        choices: [this.choix1question2, this.choix2question2, this.choix3question2, this.choix4question2],
    }
    choix1question3 = new ChoiceWithCounter('Premier choix', true, 1);
    choix2question3 = new ChoiceWithCounter('Deuxieme choix', false, 8);
    question3: Question = {
        type: QuestionType.QCM,
        text: 'Question 3',
        points: 42,
        choices: [this.choix1question3, this.choix2question3],
    }
    listQuestions: Question[] = [this.question1, this.question2, this.question3];
    questionDisplayed: number = 0;

    isChoiceWithCounter(choice: Choice): choice is ChoiceWithCounter {
        return (choice as ChoiceWithCounter).counter !== undefined;
    }
    previousQuestion() {
        if (this.questionDisplayed !== 0) {
            this.questionDisplayed--;
        }
        else {
            this.questionDisplayed = this.listQuestions.length - 1;
        }
    }
    nextQuestion() {
        if (this.questionDisplayed !== this.listQuestions.length - 1) {
            this.questionDisplayed++;
        }
        else {
            this.questionDisplayed = 0;
        }
    }
    getMaxCounter(): number{
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
