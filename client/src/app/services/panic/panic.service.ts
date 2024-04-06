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
    private pause: boolean;

    constructor(private readonly websocketService: WebSocketService) {
        this.listenForTimeEvent();
    }

    ngOnDestroy() {
        this.timeEventSubscription.unsubscribe();
    }

    setAudio() {
        this.audio = new Audio('assets/panic.mp3');
    }

    private listenForTimeEvent() {
        this.timeEventSubscription = this.websocketService.getTimeEvent().subscribe((timeEvent) => {
            switch (timeEvent) {
                case TimeEvent.Panic:
                    if (this.pause) {
                        return;
                    }
                    this.audio.currentTime = 0;
                    this.audio.play();
                    break;
                case TimeEvent.PanicEnd:
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    break;
                case TimeEvent.Pause:
                    this.pause = true;
                    this.audio.pause();
                    break;
                case TimeEvent.Resume:
                    this.pause = false;
                    this.audio.play();
                    break;
            }
        });
    }
}
