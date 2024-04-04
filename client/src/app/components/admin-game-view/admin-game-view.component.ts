import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { WebSocketService } from '@app/services/websocket/websocket.service';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [LeaderboardComponent, MatButtonModule, HistogramComponent, ChatComponent],
})
export class AdminGameViewComponent {
    constructor(readonly websocketService: WebSocketService) {}
}
