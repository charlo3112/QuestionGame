import { Component} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_DURATION } from '@common/constants';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [
        CommonModule,],
    standalone: true,
})
export class LeaderboardComponent{
    //leaderboard: Player[] = [];

    constructor(
        //private communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {}
    /*
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
    }*/
    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }
}
