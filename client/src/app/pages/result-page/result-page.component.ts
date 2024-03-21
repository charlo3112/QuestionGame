import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';

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
export class ResultPageComponent implements OnDestroy {
    constructor(readonly gameService: GameService) {}

    ngOnDestroy() {
        this.gameService.leaveRoom();
    }
}
