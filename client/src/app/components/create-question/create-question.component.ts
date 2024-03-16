import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
import { CommunicationService } from '@app/services/communication/communication.service';
import { CreateQuestionService } from '@app/services/create-question/create-question.service';
import { MIN_NB_OF_POINTS, QuestionType, SNACKBAR_DURATION, WEIGHTS_QUESTIONS } from '@common/constants';

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
export class CreateQuestionComponent implements OnChanges, OnInit {
    @Input() questionData: Question | null = null;
    @Input() isInQuestionBank: boolean = false;
    @Input() isEditingFromCreate: boolean = false;
    @Input() questionMongoId: string = '';
    @Output() questionCreated = new EventEmitter<Question>();
    @Output() closeForm: EventEmitter<void> = new EventEmitter<void>();

    questionName: string = '';
    questionPoints: number = MIN_NB_OF_POINTS;
    choiceInput: string = '';
    choices: Choice[] = [];
    editArray: boolean[] = [];
    choiceValue: boolean[] = [];
    questionToDelete: string = '';

    weights = WEIGHTS_QUESTIONS;

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly createQuestionService: CreateQuestionService,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit() {
        if (this.questionData && this.questionData.choices) {
            for (const choice of this.questionData.choices) {
                this.choiceValue.push(choice.isCorrect);
            }
        }
    }

    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }

    cancel() {
        for (let i = 0; i < this.choiceValue.length; i++) {
            this.choices[i].isCorrect = this.choiceValue[i];
        }
        this.closeForm.emit();
    }

    addChoice() {
        this.createQuestionService.addChoice(this.choiceInput, this.choices, this.editArray);
        this.choiceInput = '';
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
        const QUESTION_ALREADY_IN_BANK = 'La question est déjà dans la banque de questions.';
        this.createQuestionService
            .addToQuestionBank(this.questionName, this.questionPoints, this.choices)
            .then((newQuestion) => {
                if (newQuestion) {
                    this.questionCreated.emit(newQuestion);
                    this.closeForm.emit();
                    this.resetForm();
                }
            })
            .catch(() => {
                this.openSnackBar(QUESTION_ALREADY_IN_BANK);
            });
    }

    save() {
        if (this.createQuestionService.choiceVerif(this.questionName, this.choices)) {
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

    editQuestion() {
        const ERROR_MODIFYING_QUESTION = 'Erreur lors de la modification de la question';
        if (this.questionToDelete.length) {
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
                        this.openSnackBar(ERROR_MODIFYING_QUESTION);
                    },
                });
        } else {
            this.addToQuestionBank();
        }
    }
}
