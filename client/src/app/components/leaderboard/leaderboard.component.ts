import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SortOption } from '@app/enums/sort-option';
import { GameService } from '@app/services/game/game.service';
import { UserState } from '@common/enums/user-state';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule, MatButtonModule, MatIconModule],
    standalone: true,
})
export class LeaderboardComponent {
    constructor(readonly gameService: GameService) {}

    getClassState(state: UserState): string {
        switch (state) {
            case UserState.NoInteraction:
                return 'no-interaction';
            case UserState.FirstInteraction:
                return 'first-interaction';
            case UserState.AnswerConfirmed:
                return 'answer-confirmed';
            case UserState.Disconnect:
                return 'disconnect';
            default:
                return '';
        }
    }

    setOptionSort(option: SortOption): void {
        this.gameService.sortOption = option;
    }
}
