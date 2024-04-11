import { Component } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, LeaderboardComponent, HistogramComponent, ChatComponent],
})
export class AdminGameViewComponent {
    constructor(readonly gameService: GameService) {}

    canPanic(): boolean {
        return (
            !this.gameService.panic &&
            this.gameService.currentQuestion !== undefined &&
            ((this.gameService.currentQuestion.type === QuestionType.QCM && this.gameService.time > MIN_TIME_PANIC_QCM_S) ||
                (this.gameService.currentQuestion.type === QuestionType.QRL && this.gameService.time > MIN_TIME_PANIC_QRL_S))
        );
    }

    togglePause(): void {
        this.gameService.togglePause();
    }

    startPanicking(): void {
        if (!this.canPanic()) {
            return;
        }
        this.gameService.startPanic();
    }
}
