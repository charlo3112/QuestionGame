import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [LeaderboardComponent, MatButtonModule, HistogramComponent, ChatComponent],
})
export class AdminGameViewComponent {
    constructor(readonly gameService: GameService) {}

    get buttonText(): string {
        return this.gameService.currentState === GameState.LastQuestion ? 'Résultats' : 'Prochaine Question';
    }

    enableNextStepButton(): boolean {
        return this.gameService.currentState === GameState.ShowResults || this.gameService.currentState === GameState.LastQuestion;
    }

    canPause(): boolean {
        return this.gameService.currentState === GameState.AskingQuestion;
    }

    canPanic(): boolean {
        return (
            !this.gameService.panic &&
            this.gameService.currentQuestion !== undefined &&
            this.gameService.currentState === GameState.AskingQuestion &&
            ((this.gameService.currentQuestion.type === QuestionType.QCM && this.gameService.time > MIN_TIME_PANIC_QCM_S) ||
                (this.gameService.currentQuestion.type === QuestionType.QRL && this.gameService.time > MIN_TIME_PANIC_QRL_S))
        );
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LastQuestion) {
            this.gameService.showFinalResults();
        } else {
            this.gameService.nextQuestion();
        }
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
