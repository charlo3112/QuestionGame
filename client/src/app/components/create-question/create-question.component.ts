import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatDividerModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatSlideToggleModule,
    ],
    standalone: true,
})
export class CreateQuestionComponent {
    choices: { id: number; value: string }[] = [];
    choiceInput: string = '';

    addChoice() {
        const newChoice = {
            id: this.choices.length + 1,
            value: this.choiceInput,
        };
        this.choices.push(newChoice);
        this.choiceInput = '';
    }

    deleteChoice(index: number): void {
        this.choices.splice(index, 1);
    }
}
