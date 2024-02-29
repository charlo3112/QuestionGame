import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PLAYERS, Player } from '@app/interfaces/player';
import { SNACKBAR_DURATION } from '@common/constants';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule],
    standalone: true,
})
export class LeaderboardComponent implements OnInit {
    leaderboard: Player[] = [];

    constructor(
        // private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.fetchLeaderboard();
    }
    fetchLeaderboard() {
        this.leaderboard = PLAYERS;
        this.leaderboard.sort((a, b) => {
            return b.score - a.score;
        });
        // this.communicationService.getPlayers().subscribe({
        //     next: (response: Result<Player[]>) => {
        //         if (!response.ok) {
        //             throw new Error('Error fetching questions');
        //         }
        //         this.leaderboard = response.value;
        //         this.leaderboard.sort((a, b) => {
        //             return b.score - a.score;
        //         });
        //     },
        //     error: () => {
        //         throw new Error('Error fetching questions');
        //     },
        // });
    }
    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }
}
