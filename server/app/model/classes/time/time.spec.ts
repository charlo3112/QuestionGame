import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { CountDownTimer } from './time';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('Time', () => {
    let mockGameGatewaySend: SinonStubbedInstance<GameGatewaySend>;
    let timer: CountDownTimer;

    beforeEach(() => {
        mockGameGatewaySend = createStubInstance(GameGatewaySend);
        timer = new CountDownTimer('roomId', mockGameGatewaySend);
    });

    it('should be defined', () => {
        expect(CountDownTimer).toBeDefined();
    });

    it('should start', async () => {
        const TIME_VALUE = 4;
        await timer.start(TIME_VALUE);
        expect(timer).toBeDefined();
    });

    it('should restart', async () => {
        const TIME_VALUE = 4;
        await timer.start(TIME_VALUE);
        await timer.restart();
        expect(timer).toBeDefined();
    });

    it('should stop', async () => {
        const TIME_VALUE = 4;
        await timer.start(TIME_VALUE);
        await timer.stop();
        expect(timer).toBeDefined();
    });
});
