import { TIMEOUT_DURATION } from '@common/constants';
import { setTimeout } from 'timers/promises';
import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';

export class CountDownTimer {
    private seconds: number = 0;
    private roomId: string;
    private stopped: boolean = false;
    private gameGateway: GameGatewaySend;

    constructor(roomId: string, gameGateway: GameGatewaySend) {
        this.roomId = roomId;
        this.gameGateway = gameGateway;
    }

    async start(seconds: number) {
        this.seconds = seconds;
        await this.restart();
    }

    async restart() {
        this.stopped = false;
        while (this.seconds > 0 && !this.stopped) {
            this.gameGateway.sendTimeUpdate(this.roomId, this.seconds);
            await setTimeout(TIMEOUT_DURATION);
            --this.seconds;
        }
        this.gameGateway.sendTimeUpdate(this.roomId, this.seconds);
    }

    async stop() {
        this.stopped = true;
    }

    reset() {
        this.seconds = 0;
    }
}
