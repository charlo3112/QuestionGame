import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    imports: [CommonModule],
    standalone: true,
})
export class QuestionBankComponent {
    errorLoadingQuestions = false;
    questions: Question[] = [];

    constructor(private communicationService: CommunicationService) {
        this.loadQuestions();
    }

    loadQuestions() {
        this.communicationService.getAllQuestions().subscribe({
            next: (response) => {
                this.questions = response.body || [];
                this.questions.sort((a, b) => {
                    const dateA = new Date(a.lastModification);
                    const dateB = new Date(b.lastModification);
                    return dateA.getTime() - dateB.getTime();
                });
            },
            error: (error) => {
                if (window.confirm('Error fetching questions: ' + error + '. Do you want to retry?')) {
                    this.retryLoadingQuestions();
                } else {
                    this.errorLoadingQuestions = true;
                }
            },
        });
    }
    retryLoadingQuestions() {
        this.errorLoadingQuestions = false;
        this.loadQuestions();
    }

    getTypeOfLastModification(lastModification: unknown) {
        return typeof lastModification;
    }

    calculateTime(lastModification: Date): string {
        const lastModificationDate = new Date(lastModification);
        const now = new Date();
        const timeDiff = now.getTime() - lastModificationDate.getTime();
        const day = 1000 * 60 * 60 * 24;
        if (timeDiff < day) {
            const hours = lastModificationDate.getHours().toString().padStart(2, '0');
            const minutes = lastModificationDate.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } else {
            // More than a day, display only the date
            const year = lastModificationDate.getFullYear();
            const month = (lastModificationDate.getMonth() + 1).toString().padStart(2, '0');
            const dayOfMonth = lastModificationDate.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${dayOfMonth}`;
        }
    }
}
