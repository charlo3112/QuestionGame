import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { QUESTIONS_PLACEHOLDER, Question, QuestionWithModificationDate } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DAY_IN_MS, NOT_FOUND, SNACKBAR_DURATION } from '@common/constants';
import { Result } from '@common/result';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    imports: [CommonModule, RouterLink, MatIconModule, MatCardModule, CreateQuestionComponent, MatTooltipModule, MatButtonModule],
    standalone: true,
})
export class QuestionBankComponent {
    @Input() adminMode = false;
    @Input() showChildren = false;
    @Output() closeAdd: EventEmitter<void> = new EventEmitter<void>();
    @Output() sendQuestionSelected: EventEmitter<Question> = new EventEmitter<Question>();
    questionsWithModificationDate: QuestionWithModificationDate[] = [];
    highlightedQuestion: QuestionWithModificationDate | null;
    questionToAdd: Question = QUESTIONS_PLACEHOLDER[0];

    constructor(
        private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {
        this.loadQuestions();
    }

    loadQuestions() {
        const ERROR_FETCHING_QUESTIONS = 'Erreur lors de la récupération des questions';
        this.communicationService.getAllQuestionsWithModificationDates().subscribe({
            next: (response: Result<QuestionWithModificationDate[]>) => {
                if (!response.ok) {
                    throw new Error(ERROR_FETCHING_QUESTIONS);
                }
                this.questionsWithModificationDate = response.value;
                this.questionsWithModificationDate.sort((a, b) => {
                    const dateA = new Date(a.lastModification);
                    const dateB = new Date(b.lastModification);
                    return dateB.getTime() - dateA.getTime();
                });
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
                this.questionsWithModificationDate = this.questionsWithModificationDate.filter((question) => question.mongoId !== questionMongoId);
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
        const index = this.questionsWithModificationDate.findIndex((q) => q.text === question.text);
        if (index > NOT_FOUND) {
            this.questionsWithModificationDate[index] = question;
        } else {
            this.questionsWithModificationDate.push(question);
        }
        this.showChildren = false;
    }

    closeCreateQuestion() {
        this.showChildren = false;
        this.loadQuestions();
        this.closeAdd.emit();
    }
}
