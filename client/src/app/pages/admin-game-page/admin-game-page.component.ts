import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { PLAYERS, Player } from '@app/interfaces/player';
import { GameService } from '@app/services/game.service';
import { QUESTIONS_PLACEHOLDER, Question } from '@common/interfaces/question';

@Component({
    selector: 'app-admin-game-page',
    templateUrl: './admin-game-page.component.html',
    styleUrls: ['./admin-game-page.component.scss'],
    imports: [
        ChatComponent,
        LeaderboardComponent,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        MatToolbarModule,
        HistogramComponent,
    ],
    standalone: true,
})
export class AdminGamePageComponent implements OnInit {
    currentQuestionIndex = 1;
    question: Question;
    gameQuestions: Question[] = [];
    leaderboard: Player[] = [];

    constructor(readonly gameService: GameService) {}

    ngOnInit(): void {
        this.fetchQuestion();
        this.fetchLeaderboard();
    }

    fetchLeaderboard() {
        this.leaderboard = PLAYERS;
        this.leaderboard.sort((a, b) => {
            const scoreComparison = b.score - a.score;
            if (scoreComparison === 0) {
                return a.name.localeCompare(b.name);
            }
            return scoreComparison;
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

    fetchQuestion() {
        this.question = QUESTIONS_PLACEHOLDER[0];
    }
}
