import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { PLAYERS, Player } from '@app/interfaces/player';
import { GameService } from '@app/services/game.service';
import { WebSocketService } from '@app/services/websocket.service';
import { Question } from '@common/interfaces/question';

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
    leaderboard: Player[];
    constructor(
        readonly gameService: GameService,
        readonly websocketService: WebSocketService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question) {
            this.questionForHistogram[0] = this.question;
        }
    }

    fetchLeaderboard() {
        // TODO get array of players instead of PLAYERS
        this.leaderboard = PLAYERS;
        this.leaderboard.sort((a, b) => {
            const scoreComparison = b.score - a.score;
            if (scoreComparison === 0) {
                return a.name.localeCompare(b.name);
            }
            return scoreComparison;
        });
    }
    nextQuestion() {
        // TODO send confirmation to server to switch to the question
        this.websocketService.hostConfirm();
    }

    pauseGame() {
        // TODO send message to server to pause the timer
    }
}
