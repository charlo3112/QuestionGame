import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';

@Component({
    selector: 'app-bank-question-page',
    templateUrl: './bank-question-page.component.html',
    styleUrls: ['./bank-question-page.component.scss'],
    standalone: true,
    imports: [QuestionBankComponent],
})
export class BankQuestionPageComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit() {
        const storedLogin = sessionStorage.getItem('login');
        const login = storedLogin !== null ? JSON.parse(storedLogin) : false;
        if (!login) {
            this.router.navigate(['/admin']);
        }
    }
}
