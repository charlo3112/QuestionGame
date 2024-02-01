import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { Router } from '@angular/router';
import { Choice } from '../../interfaces/choice';
import { Question, QuestionType } from '../../interfaces/question';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatCheckboxModule,
        ReactiveFormsModule,
    ],
    standalone: true,
})
export class CreateQuestionComponent {
    constructor(private router: Router) {}
    questionName: string = '';
    questionPoints: number = 10;
    choiceInput: string = '';
    choices: Choice[] = [];
    hasAnswer(): boolean {
        let hasChecked = false;
        let hasUnchecked = false;

        for (const choice of this.choices) {
            if (choice.isCorrect) {
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
            const newChoice: Choice = {
                text: this.choiceInput,
                isCorrect: false,
            };
            this.choices.push(newChoice);
            this.choiceInput = '';
        } else {
            window.alert('Vous ne pouvez pas ajouter plus de 4 choix.');
        }
    }
    onPointsChange(newValue: number) {
        this.questionPoints = newValue;
    }
    deleteChoice(index: number): void {
        this.choices.splice(index, 1);
    }
    save() {
        if (this.choiceVerif()) {
            const newQuestion: Question = {
                type: QuestionType.Qcm,
                text: this.questionName,
                points: this.questionPoints,
                choices: this.choices,
            };
            window.alert(
                'Creation de la question : ' +
                    newQuestion.text +
                    ' Qui vaut : ' +
                    newQuestion.points +
                    '\nLes choix de réponses sont : ' +
                    newQuestion.choices[0].text +
                    ' qui est ' +
                    newQuestion.choices[0].isCorrect +
                    '\n et ' +
                    newQuestion.choices[1].text +
                    ' qui est ' +
                    newQuestion.choices[1].isCorrect,
            );
            this.router.navigate(['/new']);
        }
    }
    choiceVerif(): boolean {
        if (this.choices.length < 2) {
            window.alert("Veuillez ajouter au moins deux choix de réponse avant d'enregistrer la question");
            return false;
        } else if (!this.hasAnswer()) {
            window.alert("Il faut au moins une réponse et un choix éronné avant d'enregistrer la question");
            return false;
        }
        return true;
    }
}
