import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private interval: number | undefined;
    private readonly tick = 1000;

    private counter = 0;
    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number, execute?: () => void) {
        if (this.interval) return;
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                if (execute) {
                    execute();
                }
                this.stopTimer();
            }
        }, this.tick);
    }

    setTimeout(execute: () => void, timeMs: number) {
        setTimeout(execute, timeMs);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
