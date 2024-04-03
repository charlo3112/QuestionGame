import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { SortOption } from '@app/enums/sort-option';
import { GameService } from '@app/services/game/game.service';
import { UserState } from '@common/enums/user-state';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, FormsModule],
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

    onSortOptionChange(value: string): void {
        this.setOptionSort(value, this.selectedSortOrder);
    }

    onSortOrderChange(value: string): void {
        this.setOptionSort(this.selectedSort, value);
    }

    setOptionSort(sortOption: string, sortOrder: string): void {
        const ascending = sortOrder === 'asc';
        switch (sortOption) {
            case 'user':
                this.gameService.sortOption = ascending ? SortOption.UsernameAscending : SortOption.UsernameDescending;
                break;
            case 'score':
                this.gameService.sortOption = ascending ? SortOption.ScoreAscending : SortOption.ScoreDescending;
                break;
            case 'state':
                this.gameService.sortOption = ascending ? SortOption.StateAscending : SortOption.StateDescending;
                break;
            default:
                break;
        }
    }
}
