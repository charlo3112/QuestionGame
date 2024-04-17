import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { PANIC_DURATION, TIMEOUT_DURATION } from '@common/constants';
import { TimeData } from '@common/interfaces/time-data';
import { setTimeout } from 'timers/promises';

export class CountDownTimer {
    seconds: number = 0;
    private timeInit: number = 0;
    private roomId: string;
    private stopped: boolean = false;
    private gameGateway: GameGatewaySend;
    private panicMode: boolean = false;
    private pause: boolean = false;
    private controller = new AbortController();

    constructor(roomId: string, gameGateway: GameGatewaySend) {
        this.roomId = roomId;
        this.gameGateway = gameGateway;
    }

    get timeData(): TimeData {
        return { seconds: this.seconds, timeInit: this.timeInit, panicMode: this.panicMode, pause: this.pause };
    }

    set panic(value: boolean) {
        this.panicMode = value;
        this.gameGateway.sendTimeUpdate(this.roomId, this.timeData);
        this.controller.abort();
    }

    init(userId) {
        this.gameGateway.sendTimeUpdate(userId, this.timeData);
    }

    async start(seconds: number) {
        this.reset();
        this.seconds = seconds;
        this.timeInit = seconds;
        await this.restart();
    }

    async restart() {
        this.stopped = false;
        this.controller = new AbortController();
        while (this.seconds > 0 && !this.stopped) {
            this.gameGateway.sendTimeUpdate(this.roomId, this.timeData);
            try {
                if (this.panicMode || this.pause) {
                    await setTimeout(PANIC_DURATION, undefined, { signal: this.controller.signal });
                } else {
                    await setTimeout(TIMEOUT_DURATION, undefined, { signal: this.controller.signal });
                }
            } catch (error) {
                this.controller = new AbortController();
                continue;
            }
            if (!this.pause) {
                --this.seconds;
            }
        }
        this.pause = false;
        this.panic = false;
        this.gameGateway.sendTimeUpdate(this.roomId, this.timeData);
    }

    stop() {
        this.stopped = true;
        this.pause = false;
        this.panic = false;
        this.controller.abort();
    }

    toggle() {
        this.pause = !this.pause;
        this.gameGateway.sendTimeUpdate(this.roomId, this.timeData);
        this.controller.abort();
    }

    reset() {
        this.seconds = 0;
        this.timeInit = 0;
        this.controller.abort();
        this.panic = false;
        this.pause = false;
    }
}
