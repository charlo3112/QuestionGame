import { Injectable, OnDestroy } from '@angular/core';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { TimeData } from '@common/interfaces/time-data';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimeService implements OnDestroy {
    panicMode: boolean = false;
    pause: boolean = false;
    serverTime: number = 0;
    maxTime: number = 0;
    private audio: HTMLAudioElement = new Audio('assets/panic.mp3');
    private timeSubscription: Subscription;

    constructor(private readonly websocketService: WebSocketService) {
        this.subscribeToTimeUpdate();
        this.audio.loop = true;
    }

    reset(): void {
        this.panicMode = false;
        this.pause = false;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.serverTime = 0;
        this.maxTime = 0;
    }

    ngOnDestroy(): void {
        if (this.timeSubscription) {
            this.timeSubscription.unsubscribe();
        }
    }

    private subscribeToTimeUpdate(): void {
        this.timeSubscription = this.websocketService.getTime().subscribe({
            next: (time: TimeData) => {
                this.serverTime = time.seconds;
                this.maxTime = time.timeInit;
                this.updateEvent(time.panicMode, time.pause);
            },
        });
    }

    private updateEvent(panic: boolean, pause: boolean): void {
        if ((panic && !this.panicMode) || !panic) {
            this.audio.currentTime = 0;
        }
        this.panicMode = panic;
        this.pause = pause;
        if (!this.pause && this.panicMode) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }
}
