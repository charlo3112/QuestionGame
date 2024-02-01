<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Choice } from '@app/interfaces/choice';
=======
import { Component, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
<<<<<<< HEAD
    imports: [CommonModule, MatButtonModule],
})
export class AnswersComponent {
    @Input() choices: Choice[] = [];

    getAnswerClass() {
        return `answers-${this.choices.length}`;
=======
    imports: [MatGridListModule],
})
export class AnswersComponent {
    @Input() answers: string[] = ['a', 'b', 'c', 'd'];

    getAnswerClass() {
<<<<<<< HEAD
        return 'answers-${this.answers.length}';
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
=======
        return `answers-${this.answers.length}`;
>>>>>>> 85e3ff3 (new tests created pass)
    }
}
