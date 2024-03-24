import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-history-page',
    templateUrl: './history-page.component.html',
    styleUrls: ['./history-page.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, RouterLink],
})
export class HistoryPageComponent {}
