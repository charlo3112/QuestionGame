import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Observable } from 'rxjs';

@Injectable()
export class SubscriptionService {
    constructor(private readonly websocketService: WebSocketService) {}

    timerSubscribe(): Observable<number> {
        return this.websocketService.getTime();
    }

    stateSubscribe(): Observable<GameStatePayload> {
        return this.websocketService.getState();
    }
}
