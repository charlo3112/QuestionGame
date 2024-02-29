import { Component } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';

@Component({
    selector: 'app-admin-game-page',
    templateUrl: './admin-game-page.component.html',
    styleUrls: ['./admin-game-page.component.scss'],
    imports: [ChatComponent, LeaderboardComponent],
    standalone: true,
})
export class AdminGamePageComponent {}
