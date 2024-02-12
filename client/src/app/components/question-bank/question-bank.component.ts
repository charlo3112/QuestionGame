import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { QuestionWithModificationDate } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { DAY_IN_MS } from '@common/constants';
const MINUS_ONE = -1;

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
    highlightedQuestionIndex: number = MINUS_ONE;

    constructor(private communicationService: CommunicationService) {
        this.loadQuestions();
    }

    loadQuestions() {
        this.communicationService.getAllQuestionsWithModificationDates().subscribe({
            next: (response) => {
                this.questions = response.body || [];
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

    toggleHighlight(index: number): void {
        this.highlightedQuestionIndex = index === this.highlightedQuestionIndex ? MINUS_ONE : index;
    }
}
