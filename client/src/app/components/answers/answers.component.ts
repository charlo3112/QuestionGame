import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Choice } from '@app/interfaces/choice';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
    imports: [CommonModule, MatButtonModule],
})
export class AnswersComponent {
    @Input() choices: Choice[] = [];
    getAnswerClass() {
        return `answers-${this.choices.length}`;
    }

    questionSelected(choice: Choice) {
        choice.isSelected = !choice.isSelected;
    }
}
