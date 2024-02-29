import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, ChatComponent, MatCardModule, HistogramComponent, LeaderboardComponent],
})
export class ResultPageComponent {
    showStats: boolean;
}
