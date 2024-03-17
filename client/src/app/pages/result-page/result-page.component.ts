import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { Question } from '@common/interfaces/question';
import { USERS, UserStat } from '@common/interfaces/user-stat';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
    standalone: true,
    imports: [
        MatToolbarModule,
        ChatComponent,
        MatCardModule,
        RouterModule,
        HistogramComponent,
        CommonModule,
        LeaderboardComponent,
        MatTabsModule,
        MatButtonModule,
    ],
})
export class ResultPageComponent implements OnInit {
    histogramData: Question[] = [];
    leaderboard: UserStat[] = [];
    showStats: boolean;

    ngOnInit(): void {
        this.fetchLeaderboard();
    }

    fetchLeaderboard() {
        this.leaderboard = USERS;
        this.leaderboard.sort((a, b) => {
            const scoreComparison = b.score - a.score;
            if (scoreComparison === 0) {
                return a.username.localeCompare(b.username);
            }
            return scoreComparison;
        });
    }
}
