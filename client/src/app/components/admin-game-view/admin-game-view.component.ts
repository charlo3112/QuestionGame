import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game.service';
import { Question } from '@common/interfaces/question';
import { USERS, UserStat } from '@common/interfaces/user-stat';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [
        LeaderboardComponent,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatToolbarModule,
        HistogramComponent,
        ChatComponent,
    ],
})
export class AdminGameViewComponent implements OnChanges {
    @Input() question: Question;
    questionForHistogram: Question[] = [];
    leaderboard: UserStat[];
    constructor(readonly gameService: GameService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question) {
            this.questionForHistogram[0] = this.question;
        }
    }

    fetchLeaderboard() {
        // TODO get array of players instead of PLAYERS
        this.leaderboard = USERS;
        this.leaderboard.sort((a, b) => {
            const scoreComparison = b.score - a.score;
            if (scoreComparison === 0) {
                return a.username.localeCompare(b.username);
            }
            return scoreComparison;
        });
    }
    nextQuestion() {
        // TODO send confirmation to server to switch to the question
    }

    pauseGame() {
        // TODO send message to server to pause the timer
    }
}
