import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';
import { Question } from '@common/interfaces/question';
import { AdminQrlComponent } from '../admin-qrl/admin-qrl.component';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [LeaderboardComponent, MatButtonModule, HistogramComponent, ChatComponent, CommonModule, AdminQrlComponent],
})
export class AdminGameViewComponent implements OnInit {
    @Output() answersCorrected: EventEmitter<void> = new EventEmitter<void>();
    currentQuestion: Question;
    constructor(readonly gameService: GameService) {}
    ngOnInit() {
        if (this.gameService.currentQuestion) {
            this.currentQuestion = this.gameService.currentQuestion;
        }
    }
    qrlCorrected() {
        this.answersCorrected.emit();
    }
}
