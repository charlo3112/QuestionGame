import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [LeaderboardComponent, MatButtonModule, HistogramComponent, ChatComponent],
})
export class AdminGameViewComponent implements OnDestroy {
    private stateSubscription: Subscription;
    private panicking = false;
    private pause = false;

    constructor(
        private readonly websocketService: WebSocketService,
        private readonly gameService: GameService,
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

    private listenForStateChanges(): void {
        this.stateSubscription = this.websocketService.getState().subscribe(() => {
            this.panicking = false;
            this.pause = false;
        });
    }
}
