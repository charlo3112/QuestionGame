import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Choice } from '@app/interfaces/choice';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
})
export class AnswersComponent {
    @Input() choices: Choice[] = [];
    @Input() showAnswer: boolean = false;

    getAnswerClass() {
        return `answers-${this.choices.length}`;
    }

    questionSelected(choice: Choice) {
        choice.isSelected = !choice.isSelected;
    }
}
