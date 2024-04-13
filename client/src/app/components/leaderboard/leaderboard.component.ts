import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { SortOption } from '@common/enums/sort-option';
import { UserState } from '@common/enums/user-state';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [AppMaterialModule, CommonModule, FormsModule],
    standalone: true,
})
export class LeaderboardComponent {
    @ViewChild(MatTable) table: MatTable<UserState>;
    selectedSort = 'user';
    selectedSortOrder = 'asc';
    displayedColumns: string[] = ['username', 'score', 'bonus', 'state'];

    sortOptions = [
        { value: 'user', label: "Nom d'utilisateur" },
        { value: 'score', label: 'Score' },
        { value: 'state', label: 'État' },
    ];
    sortOrder = [
        { value: 'asc', label: 'Croissant' },
        { value: 'desc', label: 'Décroissant' },
    ];

    constructor(
        readonly gameService: GameService,
        readonly websocketService: WebSocketService,
    ) {
        if (!gameService.isPlaying) {
            this.displayedColumns.push('canChat');
        }
    }

    getClassState(state: UserState): string {
        switch (state) {
            case UserState.NO_INTERACTION:
                return 'no-interaction';
            case UserState.FIRST_INTERACTION:
                return 'first-interaction';
            case UserState.ANSWER_CONFIRMED:
                return 'answer-confirmed';
            case UserState.DISCONNECT:
                return 'disconnect';
            default:
                return '';
        }
    }

    getTextState(state: UserState): string {
        switch (state) {
            case UserState.NO_INTERACTION:
                return 'Aucune interaction';
            case UserState.FIRST_INTERACTION:
                return 'Réponse choisie';
            case UserState.ANSWER_CONFIRMED:
                return 'Réponse confirmée';
            case UserState.FINAL_RESULTS:
                return 'Résultats finaux';
            case UserState.DISCONNECT:
                return 'Déconnecté';
        }
    }

    setOptionSort(sort: Sort): void {
        const isAscending = sort.direction === 'asc';
        if (!sort.active || sort.direction === '') {
            return;
        }
        switch (sort.active) {
            case 'username':
                this.gameService.sortOption = isAscending ? SortOption.USERNAME_ASCENDING : SortOption.USERNAME_DESCENDING;
                break;
            case 'score':
                this.gameService.sortOption = isAscending ? SortOption.SCORE_ASCENDING : SortOption.SCORE_DESCENDING;
                break;
            case 'state':
                this.gameService.sortOption = isAscending ? SortOption.STATE_ASCENDING : SortOption.STATE_DESCENDING;
                break;
        }
        this.table.renderRows();
    }
}
