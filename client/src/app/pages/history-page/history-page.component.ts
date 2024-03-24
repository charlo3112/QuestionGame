import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { HistoryItemsComponent } from '@app/components/history-items/history-items.component';

@Component({
    selector: 'app-history-page',
    templateUrl: './history-page.component.html',
    styleUrls: ['./history-page.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, RouterLink, MatButtonModule, HistoryItemsComponent],
})
export class HistoryPageComponent {}
