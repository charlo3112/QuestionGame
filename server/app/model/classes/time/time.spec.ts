/* eslint-disable @typescript-eslint/no-empty-function */

import { CountDownTimer } from './time';

describe('Time', () => {
    it('should be defined', () => {
        expect(CountDownTimer).toBeDefined();
    });

    it('should start', async () => {
        const TIME_VALUE = 4;
        const timer = new CountDownTimer('roomId', () => {});
        await timer.start(TIME_VALUE);
        expect(timer).toBeDefined();
    });

    it('should restart', async () => {
        const TIME_VALUE = 4;
        const timer = new CountDownTimer('roomId', () => {});
        await timer.start(TIME_VALUE);
        await timer.restart();
        expect(timer).toBeDefined();
    });

    it('should stop', async () => {
        const TIME_VALUE = 4;
        const timer = new CountDownTimer('roomId', () => {});
        await timer.start(TIME_VALUE);
        await timer.stop();
        expect(timer).toBeDefined();
    });
});
