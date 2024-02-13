import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { QuestionWithModificationDate } from '@app/interfaces/question';
import { Result } from '@app/interfaces/result';
import { CommunicationService } from '@app/services/communication.service';
import { DAY_IN_MS, NOT_FOUND } from '@common/constants';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    imports: [CommonModule, RouterLink, MatIconModule, MatCardModule, CreateQuestionComponent],
    standalone: true,
})
export class QuestionBankComponent {
    @Input() adminMode = false;
    @Input() showChildren = false;
    @Output() closeAdd: EventEmitter<void> = new EventEmitter<void>();
    questionsWithModificationDate: QuestionWithModificationDate[] = [];
    highlightedQuestion: QuestionWithModificationDate | null;

    constructor(private communicationService: CommunicationService) {
        this.loadQuestions();
    }

    loadQuestions() {
        this.communicationService.getAllQuestionsWithModificationDates().subscribe({
            next: (response: Result<QuestionWithModificationDate[]>) => {
                if (!response.ok) {
                    throw new Error('Error fetching questions');
                }
                this.questionsWithModificationDate = response.value;
                this.questionsWithModificationDate.sort((a, b) => {
                    if (typeof a.lastModification === 'string' && typeof b.lastModification === 'string') {
                        const dateA = new Date(a.lastModification);
                        const dateB = new Date(b.lastModification);
                        return dateB.getTime() - dateA.getTime();
                    } else {
                        return b.lastModification.getTime() - a.lastModification.getTime();
                    }
                });
            },
            error: () => {
                throw new Error('Error fetching questions');
            },
        });
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
