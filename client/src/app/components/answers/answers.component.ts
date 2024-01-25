import { Component, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
    imports: [MatGridListModule],
})
export class AnswersComponent {
    @Input() answers: string[];
    // @Input() isCorrect: boolean;

    constructor() {}

    getAnswerClass() {
        return 'answers-${this.answers.length}';
    }
}
