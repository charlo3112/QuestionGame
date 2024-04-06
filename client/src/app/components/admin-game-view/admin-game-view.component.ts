import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AdminQrlComponent } from '@app/components/admin-qrl/admin-qrl.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Question } from '@common/interfaces/question';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [LeaderboardComponent, MatButtonModule, HistogramComponent, ChatComponent, CommonModule, AdminQrlComponent],
})
export class AdminGameViewComponent implements OnDestroy, OnInit {
    @Output() answersCorrected: EventEmitter<void> = new EventEmitter<void>();
    currentQuestion: Question;
    qrlAnswers: QrlAnswer[];
    readyForGrading: boolean = false;
    private stateSubscription: Subscription;
    private panicking = false;
    private pause = false;

    constructor(
        private readonly websocketService: WebSocketService,
        readonly gameService: GameService,
    ) {
        this.listenForStateChanges();
    }

    canPanic(): boolean {
        return (
            !this.panicking &&
            !this.pause &&
            this.gameService.currentQuestion !== undefined &&
            ((this.gameService.currentQuestion.type === 'QCM' && this.gameService.time > MIN_TIME_PANIC_QCM_S) ||
                (this.gameService.currentQuestion.type === 'QRL' && this.gameService.time > MIN_TIME_PANIC_QRL_S))
        );
    }

    ngOnDestroy(): void {
        this.stateSubscription.unsubscribe();
    }

    togglePause(): void {
        this.pause = !this.pause;
        this.websocketService.togglePause();
    }

    startPanicking(): void {
        if (!this.canPanic()) {
            return;
        }
        this.panicking = true;
        this.websocketService.startPanicking();
    }

    ngOnInit() {
        if (this.gameService.currentQuestion) {
            this.currentQuestion = this.gameService.currentQuestion;
        }
        this.gameService.stateSubscribe().subscribe(async (statePayload: GameStatePayload) => {
            if (statePayload.state === GameState.ShowResults && this.gameService.currentQuestion?.type === 'QRL') {
                this.qrlAnswers = await this.gameService.getQrlAnswers();
                this.readyForGrading = true;
            } else this.readyForGrading = false;
        });
    }
    qrlCorrected() {
        this.answersCorrected.emit();
    }

    private listenForStateChanges(): void {
        this.stateSubscription = this.websocketService.getState().subscribe(() => {
            this.panicking = false;
            this.pause = false;
        });
    }
}
