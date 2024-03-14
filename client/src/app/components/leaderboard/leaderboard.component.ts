import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Player } from '@app/interfaces/player';
import { SNACKBAR_DURATION } from '@common/constants';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule],
    standalone: true,
})
export class LeaderboardComponent {
    @Input() leaderboard: Player[] = [];

    constructor(private snackBar: MatSnackBar) {}

    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }
}
