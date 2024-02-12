import { Component } from '@angular/core';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';

@Component({
    selector: 'app-question-bank-admin',
    templateUrl: './question-bank-admin.component.html',
    styleUrls: ['./question-bank-admin.component.scss'],
    imports: [QuestionBankComponent],
    standalone: true,
})
export class QuestionBankAdminComponent {}
