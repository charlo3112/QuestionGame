import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Question, QuestionWithModificationDate } from '@app/interfaces/question';
import { Result } from '@app/interfaces/result';
import { CommunicationService } from '@app/services/communication.service';
import { DAY_IN_MS } from '@common/constants';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    imports: [CommonModule, RouterLink, MatIconModule, MatCardModule],
    standalone: true,
})
export class QuestionBankComponent {
    @Input() adminMode = false;
    questions: QuestionWithModificationDate[] = [];
    highlightedQuestion: Question | null;

    constructor(private communicationService: CommunicationService) {
        this.loadQuestions();
    }

    loadQuestions() {
        this.communicationService.getAllQuestionsWithModificationDates().subscribe({
            next: (response: Result<QuestionWithModificationDate[]>) => {
                if (!response.ok) {
                    throw new Error('Error fetching questions');
                }
                this.questions = response.value;
                this.questions.sort((a, b) => {
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

    deleteQuestion(questionText: string) {
        this.communicationService.deleteQuestion(questionText).subscribe({
            next: () => {
                this.questions = this.questions.filter((question) => question.text !== questionText);
                window.alert('la question ' + questionText + ' a été supprimée avec succès ');
            },
            error: () => {
                throw new Error('Error deleting question');
            },
        });
    }

    toggleHighlight(question: Question | null): void {
        this.highlightedQuestion = question === this.highlightedQuestion ? null : question;
    }
}
