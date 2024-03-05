import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { CommonModule } from '@angular/common';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, ChatComponent, MatCardModule, HistogramComponent, CommonModule, LeaderboardComponent, MatTabsModule, MatButtonModule],
})
export class ResultPageComponent {
    showStats: boolean;
}
