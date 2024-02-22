import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';

@Component({
    selector: 'app-question-bank-page',
    templateUrl: './question-bank-page.component.html',
    styleUrls: ['./question-bank-page.component.scss'],
    standalone: true,
    imports: [QuestionBankComponent, MatToolbarModule, MatButtonModule, RouterLink],
})
export class QuestionBankPageComponent implements OnInit {
    @ViewChild(QuestionBankComponent) child!: QuestionBankComponent;
    showAddQuestion = false;
    constructor(private router: Router) {}

    ngOnInit() {
        const storedLogin = sessionStorage.getItem('login');
        const login = storedLogin !== null ? JSON.parse(storedLogin) : false;
        if (!login) {
            this.router.navigate(['/admin']);
        }
    }

    handleCloseAdd() {
        this.showAddQuestion = false;
    }

    handleCreateQuestion() {
        this.showAddQuestion = true;
        this.child.toggleHighlight(null);
    }
}
