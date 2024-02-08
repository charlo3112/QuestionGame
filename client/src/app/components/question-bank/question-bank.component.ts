import { Component } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
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
                this.questions.sort((a, b) => b.lastModification?.getTime() - a.lastModification?.getTime());
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
}
