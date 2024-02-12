import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';

@Component({
    selector: 'app-question-bank-admin',
    templateUrl: './question-bank-admin.component.html',
    styleUrls: ['./question-bank-admin.component.scss'],
    imports: [QuestionBankComponent, MatToolbarModule, MatButtonModule],
    standalone: true,
})
export class QuestionBankAdminComponent {}
