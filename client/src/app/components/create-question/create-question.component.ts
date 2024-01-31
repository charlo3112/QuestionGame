import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSliderModule, MatButtonModule, MatIconModule, FormsModule, MatCheckboxModule],
    standalone: true,
})
export class CreateQuestionComponent {
    constructor(private router: Router) {}
    choices: { id: number; value: string; answer: boolean }[] = [];
    choiceInput: string = '';
    hasAnswer(): boolean {
        let hasChecked = false;
        let hasUnchecked = false;

        for (const choice of this.choices) {
            if (choice.answer) {
                hasChecked = true;
            } else {
                hasUnchecked = true;
            }

            if (hasChecked && hasUnchecked) {
                break;
            }
        }
        return hasChecked && hasUnchecked;
    }

    addChoice() {
        if (this.choices.length < 4) {
            const newChoice = {
                id: this.choices.length + 1,
                value: this.choiceInput,
                answer: false,
            };
            this.choices.push(newChoice);
            this.choiceInput = '';
        } else {
            window.alert('Vous ne pouvez pas ajouter plus de 4 choix.');
        }
    }

    deleteChoice(index: number): void {
        this.choices.splice(index, 1);
    }

    save() {
        if (this.choices.length < 2) {
            window.alert("Veuillez ajouter au moins deux choix de réponse avant d'enregistrer la question");
        } else if (!this.hasAnswer()) {
            window.alert("Il faut au moins une réponse et un choix éronné avant d'enregistrer la question");
        } else {
            this.router.navigate(['/new']);
        }
    }
}
