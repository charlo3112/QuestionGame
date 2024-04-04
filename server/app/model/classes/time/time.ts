import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { PANIC_DURATION, TIMEOUT_DURATION } from '@common/constants';
import { TimeEvent } from '@common/enums/time-event';
import { setTimeout } from 'timers/promises';

export class CountDownTimer {
    seconds: number = 0;
    private roomId: string;
    private stopped: boolean = false;
    private gameGateway: GameGatewaySend;
    private panicMode: boolean = false;
    private pause: boolean = false;

    constructor(roomId: string, gameGateway: GameGatewaySend) {
        this.roomId = roomId;
        this.gameGateway = gameGateway;
    }

    set panic(value: boolean) {
        if (value && !this.pause) {
            this.gameGateway.sendTimeEvent(this.roomId, TimeEvent.Panic);
        } else if (!this.pause) {
            this.gameGateway.sendTimeEvent(this.roomId, TimeEvent.PanicEnd);
        }
        this.panicMode = value;
    }

    async start(seconds: number) {
        this.seconds = seconds;
        this.panicMode = false;
        await this.restart();
    }

    async restart() {
        this.stopped = false;
        while (this.seconds > 0 && !this.stopped) {
            if (!this.pause) {
                this.gameGateway.sendTimeUpdate(this.roomId, this.seconds);
            }
            if (this.panicMode) {
                await setTimeout(PANIC_DURATION);
            } else {
                await setTimeout(TIMEOUT_DURATION);
            }
            if (!this.pause) {
                --this.seconds;
            }
        }
        this.gameGateway.sendTimeUpdate(this.roomId, this.seconds);
    }

    stop() {
        this.stopped = true;
        this.pause = false;
        this.panic = false;
    }

    toggle() {
        if (this.pause && this.panicMode) {
            this.gameGateway.sendTimeEvent(this.roomId, TimeEvent.Resume);
        } else if (!this.pause && this.panicMode) {
            this.gameGateway.sendTimeEvent(this.roomId, TimeEvent.Pause);
        }
        this.pause = !this.pause;
    }

    reset() {
        this.seconds = 0;
    }
}
