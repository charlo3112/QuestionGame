import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommunicationService } from '@app/services/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent implements OnInit {
    leaderboard: unknown[] = [];

    constructor(
        private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.fetchLeaderboard();
    }

    fetchLeaderboard() {
        this.communicationService.getLeaderboard().subscribe((data: unknown[]) => {
            this.leaderboard = data;
        });
    }
    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }
}
