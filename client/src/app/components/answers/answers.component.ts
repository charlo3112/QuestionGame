import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
    imports: [MatGridListModule, CommonModule],
})
export class AnswersComponent {
    @Input() answers: string[] = [];

    getAnswerClass() {
        return `answers-${this.answers.length}`;
    }
}
