import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Choice } from '@app/classes/choice';
import { Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import {
    MAX_CHOICES_NUMBER,
    MIN_CHOICES_NUMBER,
    MIN_NB_OF_POINTS,
    QuestionType,
    RESPONSE_CREATED,
    SNACKBAR_DURATION,
    WEIGHTS_QUESTIONS,
} from '@common/constants';

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
        NgIf,
        MatCardModule,
        MatListModule,
        MatSlideToggleModule,
    ],
    standalone: true,
})
export class CreateQuestionComponent implements OnChanges {
    @Input() questionData: Question | null = null;
    @Input() isInQuestionBank: boolean = false;
    @Input() questionMongoId: string = '';
    @Output() questionCreated = new EventEmitter<Question>();
    @Output() closeForm: EventEmitter<void> = new EventEmitter<void>();

    questionName: string = '';
    questionPoints: number = MIN_NB_OF_POINTS;
    choiceInput: string = '';
    choices: Choice[] = [];
    editArray: boolean[] = [];
    questionToDelete: string = '';

    weights = WEIGHTS_QUESTIONS;

    constructor(
        private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {}

    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }

    addChoice() {
        if (!(this.choiceInput === '')) {
            if (this.choices.length < MAX_CHOICES_NUMBER) {
                const newChoice: Choice = new Choice(this.choiceInput, false);
                this.choices.push(newChoice);
                this.choiceInput = '';
                this.editArray.push(false);
            } else {
                this.openSnackBar('Vous ne pouvez pas ajouter plus de 4 choix.');
            }
        } else {
            this.openSnackBar('Le champ Choix doit être rempli pour créer un choix.');
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
        this.questionPoints = MIN_NB_OF_POINTS;
        this.choices = [];
    }

    fillForm(question: Question) {
        this.questionName = question.text;
        this.questionPoints = question.points;
        this.choices = [...question.choices];
        this.questionToDelete = question.text;
    }

    deleteChoice(index: number): void {
        this.choices.splice(index, 1);
    }

    addToQuestionBank() {
        if (this.choiceVerif()) {
            const newQuestion: Question = {
                type: QuestionType.QCM,
                text: this.questionName,
                points: +parseInt(this.questionPoints.toString(), 10),
                choices: this.choices,
            };
            this.communicationService.addQuestion(newQuestion).subscribe({
                next: (response) => {
                    if (response.status === RESPONSE_CREATED) {
                        this.questionCreated.emit(newQuestion);
                        this.closeForm.emit();
                        this.resetForm();
                    }
                },
                error: () => {
                    this.openSnackBar('La question est déjà dans la banque de questions.');
                },
            });
        }
    }

    save() {
        if (this.choiceVerif()) {
            const newQuestion: Question = {
                type: QuestionType.QCM,
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
            this.openSnackBar('Le champ Question ne peut pas être vide.');
            return false;
        } else if (this.choices.length < MIN_CHOICES_NUMBER) {
            this.openSnackBar("Veuillez ajouter au moins deux choix de réponse avant d'enregistrer la question.");
            return false;
        } else if (!this.hasAnswer()) {
            this.openSnackBar("Il faut au moins une réponse et un choix éronné avant d'enregistrer la question.");
            return false;
        }
        return true;
    }

    editQuestion() {
        if (this.questionToDelete !== '') {
            this.communicationService
                .modifyQuestion({
                    type: QuestionType.QCM,
                    text: this.questionName,
                    points: this.questionPoints,
                    choices: this.choices,
                    lastModification: new Date(),
                    mongoId: this.questionMongoId,
                })
                .subscribe({
                    next: () => {
                        this.closeForm.emit();
                        this.resetForm();
                    },
                    error: () => {
                        this.openSnackBar('Error deleting question');
                    },
                });
        } else {
            this.addToQuestionBank();
        }
    }
}
