import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DAY_IN_MS, NOT_FOUND, SNACKBAR_DURATION } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { QUESTIONS_PLACEHOLDER, Question, QuestionWithModificationDate } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    imports: [CommonModule, RouterLink, FormsModule, CreateQuestionComponent, AppMaterialModule],
    standalone: true,
})
export class QuestionBankComponent implements OnInit {
    @Input() adminMode = false;
    @Input() showChildren = false;
    @Output() closeAdd: EventEmitter<void> = new EventEmitter<void>();
    @Output() formClosed: EventEmitter<void> = new EventEmitter<void>();
    @Output() sendQuestionSelected: EventEmitter<Question> = new EventEmitter<Question>();

    questions: QuestionWithModificationDate[] = [];
    displayedQuestions: QuestionWithModificationDate[] = [];
    highlightedQuestion: QuestionWithModificationDate | null;
    questionToAdd: Question = QUESTIONS_PLACEHOLDER[0];
    sortOptions = [
        { value: 'all', label: 'Tous' },
        { value: 'QCM', label: 'QCM' },
        { value: 'QRL', label: 'QRL' },
    ];
    selectedSort: string = 'all';

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly snackBar: MatSnackBar,
    ) {
        this.loadQuestions();
    }

    ngOnInit(): void {
        this.loadQuestions();
    }
    loadQuestions(): void {
        const ERROR_FETCHING_QUESTIONS = 'Erreur lors de la récupération des questions';
        this.communicationService.getAllQuestionsWithModificationDates().subscribe({
            next: (response: Result<QuestionWithModificationDate[]>) => {
                if (!response.ok) {
                    throw new Error(ERROR_FETCHING_QUESTIONS);
                }
                this.questions = response.value;
                this.questions.sort((a, b) => {
                    const dateA = new Date(a.lastModification);
                    const dateB = new Date(b.lastModification);
                    return dateB.getTime() - dateA.getTime();
                });
                this.displayedQuestions = [...this.questions];
            },
            error: () => {
                throw new Error(ERROR_FETCHING_QUESTIONS);
            },
        });
    }
    sendQuestion(): void {
        const QUESTION_SELECTED_BEFORE_ADDING = "Vous devez selectionner une question avant de l'ajouter";
        if (this.highlightedQuestion) {
            this.questionToAdd = {
                text: this.highlightedQuestion.text,
                points: +parseInt(this.highlightedQuestion.points.toString(), 10),
                type: this.highlightedQuestion.type,
            } as Question;
            if (this.highlightedQuestion.type === QuestionType.QCM && this.questionToAdd.type === QuestionType.QCM) {
                this.questionToAdd.choices = this.highlightedQuestion.choices.slice();
            }
            this.sendQuestionSelected.emit(this.questionToAdd);
        } else {
            this.snackBar.open(QUESTION_SELECTED_BEFORE_ADDING, undefined, {
                duration: SNACKBAR_DURATION,
            });
        }
    }
    filterQuestionsByType(): void {
        this.displayedQuestions = [...this.questions];
        if (this.selectedSort !== 'all') {
            this.displayedQuestions = this.displayedQuestions.filter((question) => question.type === this.selectedSort);
        }
    }
    calculateTime(lastModification: Date): string {
        const lastModificationDate = new Date(lastModification);
        const now = new Date();
        const timeDiff = now.getTime() - lastModificationDate.getTime();
        const day = DAY_IN_MS;
        if (timeDiff < day) {
            const hours = lastModificationDate.getHours().toString().padStart(2, '0');
            const minutes = lastModificationDate.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } else {
            const year = lastModificationDate.getFullYear();
            const month = (lastModificationDate.getMonth() + 1).toString().padStart(2, '0');
            const dayOfMonth = lastModificationDate.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${dayOfMonth}`;
        }
    }

    deleteQuestion(questionMongoId: string): void {
        this.communicationService.deleteQuestion(questionMongoId).subscribe({
            next: () => {
                this.questions = this.questions.filter((question) => question.mongoId !== questionMongoId);
            },
            error: () => {
                throw new Error('Error deleting question');
            },
        });
    }

    toggleHighlight(question: QuestionWithModificationDate | null): void {
        this.highlightedQuestion = question === this.highlightedQuestion ? null : question;
    }

    editQuestion(question: QuestionWithModificationDate): void {
        this.highlightedQuestion = question;
        this.showChildren = true;
    }

    insertQuestion(question: QuestionWithModificationDate): void {
        const index = this.questions.findIndex((q) => q.text === question.text);
        if (index > NOT_FOUND) {
            this.questions[index] = question;
        } else {
            this.questions.push(question);
        }
        this.showChildren = false;
    }

    closeCreateQuestion(): void {
        this.showChildren = false;
        this.loadQuestions();
        this.closeAdd.emit();
    }

    closeQuestionBank(): void {
        this.formClosed.emit();
    }
}
