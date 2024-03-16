import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule],
    standalone: true,
})
export class LeaderboardComponent {
    constructor(readonly gameService: GameService) {}
}
