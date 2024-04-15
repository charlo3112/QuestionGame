import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { HistoryItemsComponent } from '@app/components/history-items/history-items.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminService } from '@app/services/admin/admin.service';

@Component({
    selector: 'app-history-page',
    templateUrl: './history-page.component.html',
    styleUrls: ['./history-page.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, RouterLink, MatButtonModule, HistoryItemsComponent],
})
export class HistoryPageComponent implements OnInit {
    constructor(
        private readonly router: Router,
        private readonly adminService: AdminService,
    ) {}

    ngOnInit(): void {
        if (!this.adminService.login) {
            this.router.navigate(['/admin']);
        }
    }
}
