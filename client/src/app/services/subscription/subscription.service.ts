import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Observable } from 'rxjs';

@Injectable()
export class SubscriptionService {
    // private scoreSubscription: Subscription;
    constructor(
        private readonly websocketService: WebSocketService, // private readonly routerService: Router,
        // private readonly snackBarService: MatSnackBar,
    ) // private readonly gameService: GameService,
    {}

    timerSubscribe(): Observable<number> {
        return this.websocketService.getTime();
    }

    stateSubscribe(): Observable<GameStatePayload> {
        return this.websocketService.getState();
    }

    // subscribeToClosedConnection(messagesSubscription: Subscription, test: boolean, websocket: WebSocketService) {
    //     messagesSubscription = websocket.getClosedConnection().subscribe({
    //         next: (message: string) => {
    //             this.snackBarService.open(message, undefined, { duration: SNACKBAR_DURATION });
    //             if (test) {
    //                 this.routerService.navigate(['/new']);
    //             } else {
    //                 this.routerService.navigate(['/']);
    //             }
    //         },
    //     });
    // }

    subscribeToScoreUpdate(callback: (score: GameStatePayload) => void): void {
        this.websocketService.getState().subscribe({
            next: (state: GameStatePayload) => {
                callback(state);
            },
        });
    }

    subscribeToUserUpdate(callback: (user: UserConnectionUpdate) => void): void {
        this.websocketService.getUserUpdate().subscribe({
            next: (user: UserConnectionUpdate) => {
                callback(user);
            },
        });
    }
}
