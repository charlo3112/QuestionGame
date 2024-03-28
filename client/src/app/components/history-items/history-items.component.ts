import { CommonModule } from '@angular/common';
import { Component, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { History } from '@common/interfaces/history';

@Component({
    selector: 'app-history-items',
    templateUrl: './history-items.component.html',
    styleUrls: ['./history-items.component.scss'],
    standalone: true,
    imports: [MatCardModule, CommonModule, FormsModule, MatButtonModule, MatSelectModule, MatGridListModule, MatButtonModule, MatSnackBarModule],
})
export class HistoryItemsComponent implements OnChanges {
    selectedSort: string = 'name';
    selectedSortOrder: string = 'az';
    historyItems: History[] = [];
    sortOptions = [
        { value: 'name', label: 'Nom du jeu' },
        { value: 'creationDate', label: 'Date de création' },
    ];

    sortOrderOptionsName = [
        { value: 'az', label: 'A-Z' },
        { value: 'za', label: 'Z-A' },
    ];

    sortOrderOptionsDate = [
        { value: 'recent', label: 'Plus récent' },
        { value: 'old', label: 'Plus ancien' },
    ];

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly snackBar: MatSnackBar,
    ) {
        this.getHistory();
    }

    ngOnChanges() {
        this.sortItems(this.selectedSort, this.selectedSortOrder);
    }

    emptyHistory() {
        const DELETE_ERROR = "Erreur lors de la suppression de l'historique";
        this.communicationService.deleteHistories().subscribe((response) => {
            if (response.ok) {
                this.historyItems = [];
            } else {
                this.openSnackBar(DELETE_ERROR);
            }
        });
    }

    getHistory() {
        const FETCH_ERROR = "Erreur lors de la récupération de l'historique";
        this.communicationService.getHistories().subscribe((histories) => {
            if (histories.ok) {
                this.historyItems = histories.value.map((item: History) => {
                    return {
                        ...item,
                        date: new Date(item.date),
                    };
                });
                this.sortItems(this.selectedSort, this.selectedSortOrder);
            } else {
                this.openSnackBar(FETCH_ERROR);
            }
        });
    }

    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }

    onSortOptionChange(value: string) {
        this.selectedSort = value;
        if (value === 'creationDate') {
            this.selectedSortOrder = 'recent';
        } else {
            this.selectedSortOrder = 'az';
        }
        this.sortItems(this.selectedSort, this.selectedSortOrder);
    }

    onSortOrderChange(value: string) {
        this.selectedSortOrder = value;
        this.sortItems(this.selectedSort, this.selectedSortOrder);
    }

    sortItems(value: string, order: string) {
        this.historyItems.sort((a, b) => {
            const aTemp = value === 'name' ? a.name : a.date.getTime();
            const bTemp = value === 'name' ? b.name : b.date.getTime();

            if (order === 'az' || order === 'old') {
                // -1 is used to sort in ascending order
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                return aTemp < bTemp ? -1 : aTemp > bTemp ? 1 : 0;
            } else {
                // -1 is used to sort in descending order
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                return aTemp > bTemp ? -1 : aTemp < bTemp ? 1 : 0;
            }
        });
    }
}
