import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { QuestionWithModificationDate } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { DAY_IN_MS } from '@common/constants';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    imports: [CommonModule, MatToolbarModule, RouterLink, MatIconModule, MatCardModule],
    standalone: true,
})
export class QuestionBankComponent {
    @Input() adminMode = false;
    questions: QuestionWithModificationDate[] = [];

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
            next: (response) => {},
            error: () => {
                throw new Error('Error deleting question');
            },
        });
    }
}
