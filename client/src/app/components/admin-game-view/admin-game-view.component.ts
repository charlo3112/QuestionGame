import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AdminQrlComponent } from '@app/components/admin-qrl/admin-qrl.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, LeaderboardComponent, HistogramComponent, ChatComponent, AdminQrlComponent],
})
export class AdminGameViewComponent implements OnInit {
    @Output() answersCorrected: EventEmitter<void> = new EventEmitter<void>();
    currentQuestion: Question;
    qrlAnswers: QrlAnswer[];
    readyForGrading: boolean = false;

    constructor(
        private readonly websocketService: WebSocketService,
        readonly gameService: GameService,
    ) {}

    get buttonText(): string {
        return this.gameService.currentState === GameState.LAST_QUESTION ? 'Résultats' : 'Prochaine Question';
    }

    enableNextStepButton(): boolean {
        return this.gameService.currentState === GameState.SHOW_RESULTS || this.gameService.currentState === GameState.LAST_QUESTION;
    }

    canPause(): boolean {
        return this.gameService.currentState === GameState.ASKING_QUESTION;
    }

    canPanic(): boolean {
        return (
            !this.gameService.panic &&
            this.gameService.currentQuestion !== undefined &&
            this.gameService.currentState === GameState.ASKING_QUESTION &&
            ((this.gameService.currentQuestion.type === QuestionType.QCM && this.gameService.time > MIN_TIME_PANIC_QCM_S) ||
                (this.gameService.currentQuestion.type === QuestionType.QRL && this.gameService.time > MIN_TIME_PANIC_QRL_S))
        );
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LAST_QUESTION) {
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

    ngOnInit() {
        if (this.gameService.currentQuestion) {
            this.currentQuestion = this.gameService.currentQuestion;
        }
        this.websocketService.getState().subscribe(async (statePayload: GameStatePayload) => {
            if (statePayload.state === GameState.SHOW_FINAL_RESULTS && this.gameService.currentQuestion?.type === QuestionType.QRL) {
                this.qrlAnswers = await this.gameService.getQrlAnswers();
                this.readyForGrading = true;
            } else this.readyForGrading = false;
        });
    }
    qrlCorrected() {
        this.answersCorrected.emit();
    }
}
