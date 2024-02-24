import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Result } from '@app/interfaces/result';
import { CommunicationService } from '@app/services/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent implements OnInit {
    leaderboard: Player[] = [];

    constructor(
        private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.fetchLeaderboard();
    }

    fetchLeaderboard() {
        this.communicationService.getLeaderboard().subscribe({
            next: (response: Result<Player[]>) => {
                if (!response.ok) {
                    throw new Error('Error fetching questions');
                }
                this.leaderboard = response.value;
                this.leaderboard.sort((a, b) => {
                    return b.getScore() - a.getScore();
                });
            },
            error: () => {
                throw new Error('Error fetching questions');
            },
        });
    }
    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }
}
