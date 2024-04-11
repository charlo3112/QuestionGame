import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EraseHistoryDialogComponent } from '@app/components/erase-history-dialog/erase-history-dialog.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { History } from '@common/interfaces/history';

@Component({
    selector: 'app-history-items',
    templateUrl: './history-items.component.html',
    styleUrls: ['./history-items.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, CommonModule, FormsModule],
})
export class HistoryItemsComponent implements OnInit {
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
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.getHistory();
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

    openEraseDialog() {
        const dialogRef = this.dialog.open(EraseHistoryDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.emptyHistory();
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
            if (value === 'name') {
                if (order === 'az') return a.name.localeCompare(b.name);
                return b.name.localeCompare(a.name);
            }
            if (order === 'recent') return a.date.getTime() - b.date.getTime();
            return b.date.getTime() - a.date.getTime();
        });
    }
}
