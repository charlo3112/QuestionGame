import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CreateQuestionService } from '@app/services/create-question/create-question.service';
import { MIN_NB_OF_POINTS, SNACKBAR_DURATION, WEIGHTS_QUESTIONS } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { Choice } from '@common/interfaces/choice';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
    imports: [AppMaterialModule, CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
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
    questionType: QuestionType;
    questionTypeOptions: QuestionType[] = [QuestionType.QRL, QuestionType.QCM];

    weights = WEIGHTS_QUESTIONS;

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly createQuestionService: CreateQuestionService,
        private readonly snackBar: MatSnackBar,
    ) {}

    ngOnInit() {
        if (this.questionData && this.questionData.choices) {
            for (const choice of this.questionData.choices) {
                if (choice.isCorrect !== undefined) this.choiceValue.push(choice.isCorrect);
            }
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

    addChoice() {
        this.createQuestionService.addChoice(this.choiceInput, this.choices, this.editArray);
        this.choiceInput = '';
    }

    addToQuestionBank() {
        const QUESTION_ALREADY_IN_BANK = 'La question est déjà dans la banque de questions.';
        if (this.questionType === QuestionType.QRL) this.choices = [];
        this.createQuestionService
            .addToQuestionBank(this.questionName, this.questionPoints, this.choices, this.questionType)
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

    cancel() {
        for (let i = 0; i < this.choiceValue.length; i++) {
            this.choices[i].isCorrect = this.choiceValue[i];
        }
        this.closeForm.emit();
    }
    deleteChoice(index: number): void {
        this.choices.splice(index, 1);
    }

    drop(event: CdkDragDrop<Choice[]>): void {
        moveItemInArray(this.choices, event.previousIndex, event.currentIndex);
    }

    editQuestion() {
        const ERROR_MODIFYING_QUESTION = 'Erreur lors de la modification de la question';
        if (this.questionToDelete.length) {
            this.communicationService
                .modifyQuestion({
                    type: this.questionType,
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

    fillForm(question: Question) {
        this.questionName = question.text;
        this.questionPoints = question.points;
        this.choices = [...question.choices];
        this.questionType = question.type;
        this.questionToDelete = question.text;
    }

    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }

    resetForm() {
        this.questionName = '';
        this.questionPoints = MIN_NB_OF_POINTS;
        this.choices = [];
    }

    save() {
        if (this.questionType === QuestionType.QCM) {
            if (this.createQuestionService.choiceVerif(this.questionName, this.choices)) {
                const newQuestion: Question = {
                    type: this.questionType,
                    text: this.questionName,
                    points: this.questionPoints,
                    choices: this.choices,
                };
                this.questionCreated.emit(newQuestion);
                this.resetForm();
            }
        } else if (this.questionType === QuestionType.QRL) {
            const newQuestion: Question = {
                type: this.questionType,
                text: this.questionName,
                points: this.questionPoints,
                choices: this.choices,
            };
            this.questionCreated.emit(newQuestion);
            this.resetForm();
        }
    }

    saveEdit(index: number) {
        this.editArray[index] = false;
    }

    startEdit(index: number) {
        this.editArray[index] = !this.editArray[index];
    }
}
