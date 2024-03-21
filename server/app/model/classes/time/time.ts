import { GameGateway } from '@app/gateways/game/game.gateway';
import { TIMEOUT_DURATION } from '@common/constants';
import { Injectable, Scope } from '@nestjs/common';
import { setTimeout } from 'timers/promises';

@Injectable({ scope: Scope.TRANSIENT })
export class CountDownTimer {
    private seconds: number = 0;
    private roomId: string;
    private stopped: boolean = false;

    constructor(private readonly gameGateway: GameGateway) {}

    setRoomId(roomId: string) {
        this.roomId = roomId;
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
}
