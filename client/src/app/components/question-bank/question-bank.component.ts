import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DAY_IN_MS, NOT_FOUND, SNACKBAR_DURATION } from '@common/constants';
import { QUESTIONS_PLACEHOLDER, Question, QuestionWithModificationDate } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatCardModule,
        CreateQuestionComponent,
        MatTooltipModule,
        MatButtonModule,
    ],
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
    loadQuestions() {
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
    sendQuestion() {
        const QUESTION_SELECTED_BEFORE_ADDING = "Vous devez selectionner une question avant de l'ajouter";
        if (this.highlightedQuestion) {
            this.questionToAdd = {
                text: this.highlightedQuestion.text,
                points: +parseInt(this.highlightedQuestion.points.toString(), 10),
                choices: this.highlightedQuestion.choices.slice(),
                type: this.highlightedQuestion.type,
            };
            this.sendQuestionSelected.emit(this.questionToAdd);
        } else {
            this.snackBar.open(QUESTION_SELECTED_BEFORE_ADDING, undefined, {
                duration: SNACKBAR_DURATION,
            });
        }
    }
    filterQuestionsByType() {
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

    deleteQuestion(questionMongoId: string) {
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

    editQuestion(question: QuestionWithModificationDate) {
        this.highlightedQuestion = question;
        this.showChildren = true;
    }

    insertQuestion(question: QuestionWithModificationDate) {
        const index = this.questions.findIndex((q) => q.text === question.text);
        if (index > NOT_FOUND) {
            this.questions[index] = question;
        } else {
            this.questions.push(question);
        }
        this.showChildren = false;
    }

    closeCreateQuestion() {
        this.showChildren = false;
        this.loadQuestions();
        this.closeAdd.emit();
    }

    closeQuestionBank() {
        this.formClosed.emit();
    }
}
