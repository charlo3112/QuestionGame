import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
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

    subscribeToStateUpdate(callback: (state: GameStatePayload) => void): void {
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

    subscribeToUserStatUpdate(callback: (user: UserStat[]) => void): void {
        this.websocketService.getUsersStat().subscribe({
            next: (userStat: UserStat[]) => {
                callback(userStat);
            },
        });
    }
    subscribeToScoreUpdate(callback: (score: Score) => void): void {
        this.websocketService.getScoreUpdate().subscribe({
            next: (score: Score) => {
                callback(score);
            },
        });
    }

    subscribeToHistogramData(callback: (data: HistogramData) => void): void {
        this.websocketService.getHistogramData().subscribe({
            next: (data: HistogramData) => {
                callback(data);
            },
        });
    }
}
