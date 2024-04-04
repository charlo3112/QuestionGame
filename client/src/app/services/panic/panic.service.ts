import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { TimeEvent } from '@common/enums/time-event';

@Injectable({
    providedIn: 'root',
})
export class PanicService implements OnDestroy {
    private audio: HTMLAudioElement;
    private timeEventSubscription: Subscription;

    constructor(private readonly websocketService: WebSocketService) {
        this.listenForTimeEvent();
    }

    ngOnDestroy() {
        this.timeEventSubscription.unsubscribe();
    }

    setAudio() {
        this.audio = new Audio('assets/panic.mp3');
    }

    listenForTimeEvent() {
        this.timeEventSubscription = this.websocketService.getTimeEvent().subscribe((timeEvent) => {
            switch (timeEvent) {
                case TimeEvent.Panic:
                    this.audio.play();
                    break;
                case TimeEvent.PanicEnd:
                    this.audio.pause();
                    break;
                case TimeEvent.Pause:
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    break;
            }
        });
    }
}
