import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import * as Constants from '../../../../../constants';
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
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        DragDropModule,
    ],
    standalone: true,
})
export class CreateQuestionComponent implements OnChanges {
    @Input() questionData: Question | null = null;
    @Output() questionCreated = new EventEmitter<Question>();

    questionName: string = '';
    questionPoints: number = Constants.MIN_POINT;
    choiceInput: string = '';
    choices: Choice[] = [];
    editArray: boolean[] = [];

    constructor(/*private communicationService: CommunicationService*/) {}

    addChoice() {
        if (!(this.choiceInput === '')) {
            if (this.choices.length < Constants.MAX_CHOICES) {
                const newChoice: Choice = {
                    text: this.choiceInput,
                    isCorrect: false,
                };
                this.choices.push(newChoice);
                this.choiceInput = '';
                this.editArray.push(false);
            } else {
                window.alert('Vous ne pouvez pas ajouter plus de 4 choix.');
            }
        } else {
            window.alert('Le champ Choix doit être rempli pour créer un choix.');
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.questionData) {
            if (this.questionData) {
                this.fillForm(this.questionData);
            } else {
                this.resetForm();
            }
        }
    }

    resetForm() {
        this.questionName = '';
        this.questionPoints = Constants.MIN_POINT;
        this.choices = [];
    }

    fillForm(question: Question) {
        this.questionName = question.text;
        this.questionPoints = question.points;
        this.choices = [...question.choices];
    }

    deleteChoice(index: number): void {
        this.choices.splice(index, 1);
    }

    /*
    addToQuestionBank() {
        if (this.choiceVerif()) {
            const newQuestion: Question = {
                type: QuestionType.Qcm,
                text: this.questionName,
                points: this.questionPoints,
                choices: this.choices,
            };
            this.communicationService.addQuestion(newQuestion).subscribe({
                next: (response) => {
                    response;
                    this.questionCreated.emit(newQuestion);
                    this.resetForm();
                },
                error: (error) => {
                    error;
                },
            });
        }
    }
    */

    save() {
        if (this.choiceVerif()) {
            const newQuestion: Question = {
                type: QuestionType.Qcm,
                text: this.questionName,
                points: this.questionPoints,
                choices: this.choices,
            };
            this.questionCreated.emit(newQuestion);
            this.resetForm();
        }
    }

    startEdit(index: number) {
        this.editArray[index] = !this.editArray[index];
    }

    saveEdit(index: number) {
        this.editArray[index] = false;
    }

    drop(event: CdkDragDrop<Choice[]>): void {
        moveItemInArray(this.choices, event.previousIndex, event.currentIndex);
    }
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
    choiceVerif(): boolean {
        if (this.questionName === '') {
            window.alert('Le champ Question ne peut pas être vide.');
            return false;
        } else if (this.choices.length < Constants.MIN_CHOICES) {
            window.alert("Veuillez ajouter au moins deux choix de réponse avant d'enregistrer la question.");
            return false;
        } else if (!this.hasAnswer()) {
            window.alert("Il faut au moins une réponse et un choix éronné avant d'enregistrer la question.");
            return false;
        }
        return true;
    }
}
