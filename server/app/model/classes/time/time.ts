import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { PANIC_DURATION, TIMEOUT_DURATION } from '@common/constants';
import { setTimeout } from 'timers/promises';

export class CountDownTimer {
    private seconds: number = 0;
    private roomId: string;
    private stopped: boolean = false;
    private gameGateway: GameGatewaySend;
    private panicMode: boolean = false;

    constructor(roomId: string, gameGateway: GameGatewaySend) {
        this.roomId = roomId;
        this.gameGateway = gameGateway;
    }

    set panic(value: boolean) {
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
            this.gameGateway.sendTimeUpdate(this.roomId, this.seconds);
            if (this.panicMode) {
                await setTimeout(PANIC_DURATION);
            } else {
                await setTimeout(TIMEOUT_DURATION);
            }
            --this.seconds;
        }
        this.gameGateway.sendTimeUpdate(this.roomId, this.seconds);
    }

    async stop() {
        this.stopped = true;
    }

    async toggle() {
        this.stopped = !this.stopped;
        if (!this.stopped) {
            await this.restart();
        }
    }

    reset() {
        this.seconds = 0;
    }
}
