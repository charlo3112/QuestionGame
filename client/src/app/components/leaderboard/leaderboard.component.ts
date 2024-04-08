import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { SortOption } from '@app/enums/sort-option';
import { GameService } from '@app/services/game/game.service';
import { UserState } from '@common/enums/user-state';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, FormsModule, MatSortModule],
    standalone: true,
})
export class LeaderboardComponent {
    selectedSort = 'user';
    selectedSortOrder = 'asc';
    sortOptions = [
        { value: 'user', label: "Nom d'utilisateur" },
        { value: 'score', label: 'Score' },
        { value: 'state', label: 'État' },
    ];
    sortOrder = [
        { value: 'asc', label: 'Croissant' },
        { value: 'desc', label: 'Décroissant' },
    ];

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

    setOptionSort(sort: Sort): void {
        const isAscending = sort.direction === 'asc';
        if (!sort.active || sort.direction === '') {
            return;
        }
        switch (sort.active) {
            case 'user':
                this.gameService.sortOption = isAscending ? SortOption.UsernameAscending : SortOption.UsernameDescending;
                break;
            case 'score':
                this.gameService.sortOption = isAscending ? SortOption.ScoreAscending : SortOption.ScoreDescending;
                break;
            case 'state':
                this.gameService.sortOption = isAscending ? SortOption.StateAscending : SortOption.StateDescending;
                break;
        }
    }
}
