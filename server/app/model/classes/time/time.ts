import { TIMEOUT_DURATION } from '@common/constants';
import { setTimeout } from 'timers/promises';

export class CountDownTimer {
    private seconds: number = 0;
    private updateTime: (roomId: string, time: number) => void;
    private roomId: string;
    private stopped: boolean = false;

    constructor(roomId: string, updateTime: (roomId: string, time: number) => void) {
        this.roomId = roomId;
        this.updateTime = updateTime;
    }

    async start(seconds: number) {
        this.seconds = seconds;
        await this.restart();
    }

    async restart() {
        this.stopped = false;
        while (this.seconds > 0 && !this.stopped) {
            this.updateTime(this.roomId, this.seconds);
            await setTimeout(TIMEOUT_DURATION);
            --this.seconds;
        }
        this.updateTime(this.roomId, this.seconds);
    }

    async stop() {
        this.stopped = true;
    }
}
