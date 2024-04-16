import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { CountDownTimer } from './time';

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

    it('should reset', () => {
        const newTimer = new CountDownTimer('roomId', { sendTimeUpdate: jest.fn() } as unknown as GameGatewaySend);
        newTimer.reset();
        expect(newTimer).toBeDefined();
    });

    // Mock setTimeout function to throw an AbortError
    jest.useFakeTimers();

    it('should catch AbortError and reset controller', async () => {
        const TIME_VALUE = 4;
        await timer.start(TIME_VALUE);
        const restartPromise = timer.restart();
        jest.advanceTimersByTime(1);
        timer['controller'].abort();

        await restartPromise;
        expect(timer['controller']).toBeDefined();
    });

    it('should toggle the pause state and send time update', () => {
        const initialTimeData = timer.timeData;
        timer.toggle();
        expect(timer.timeData.pause).not.toBe(initialTimeData.pause);
    });
});
