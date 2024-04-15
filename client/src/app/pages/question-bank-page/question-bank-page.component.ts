import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminService } from '@app/services/admin/admin.service';
@Component({
    selector: 'app-question-bank-page',
    templateUrl: './question-bank-page.component.html',
    styleUrls: ['./question-bank-page.component.scss'],
    standalone: true,
    imports: [QuestionBankComponent, AppMaterialModule, RouterLink, CommonModule],
})
export class QuestionBankPageComponent implements OnInit {
    @ViewChild(QuestionBankComponent) child!: QuestionBankComponent;
    showAddQuestion = false;
    constructor(
        private readonly router: Router,
        private readonly adminService: AdminService,
    ) {}

    ngOnInit(): void {
        if (!this.adminService.login) {
            this.router.navigate(['/admin']);
        }
    }

    handleCloseAdd(): void {
        this.showAddQuestion = false;
    }

    handleCreateQuestion(): void {
        this.showAddQuestion = true;
        this.child.toggleHighlight(null);
    }
}
