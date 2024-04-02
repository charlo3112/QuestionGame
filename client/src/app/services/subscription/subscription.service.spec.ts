import { TestBed } from '@angular/core/testing';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { MOCK_CHOICES_COUNTER } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { of } from 'rxjs';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
    let service: SubscriptionService;
    let websocketServiceMock: jasmine.SpyObj<WebSocketService>;
    const TIMER_TEST_VALUE = 100;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('WebSocketService', [
            'getState',
            'getTime',
            'getUserUpdate',
            'getUsersStat',
            'getScoreUpdate',
            'getHistogramData',
        ]);

        TestBed.configureTestingModule({
            providers: [SubscriptionService, { provide: WebSocketService, useValue: spy }],
        });

        service = TestBed.inject(SubscriptionService);
        websocketServiceMock = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should subscribe to timer updates', () => {
        const timeObservable = of(TIMER_TEST_VALUE);
        websocketServiceMock.getTime.and.returnValue(timeObservable);

        const result = service.timerSubscribe();

        expect(result).toEqual(timeObservable);
        expect(websocketServiceMock.getTime).toHaveBeenCalled();
    });

    it('should subscribe to state updates', () => {
        const stateObservable = of({ state: GameState.Wait } as GameStatePayload);
        websocketServiceMock.getState.and.returnValue(stateObservable);

        const result = service.stateSubscribe();

        expect(result).toEqual(stateObservable);
        expect(websocketServiceMock.getState).toHaveBeenCalled();
    });

    it('should subscribe to state updates', () => {
        const stateObservable = of({ state: GameState.Wait } as GameStatePayload);
        websocketServiceMock.getState.and.returnValue(stateObservable);

        let callbackCalled = false;
        service.subscribeToStateUpdate((state: GameStatePayload) => {
            callbackCalled = true;
            expect(state).toEqual({ state: GameState.Wait } as GameStatePayload);
        });

        expect(websocketServiceMock.getState).toHaveBeenCalled();
        expect(callbackCalled).toBeTruthy();
    });

    it('should subscribe to user updates', () => {
        const userUpdateObservable = of({
            user: { username: 'Test', isConnected: true },
            isConnected: true,
            username: 'Test',
        } as UserConnectionUpdate);
        websocketServiceMock.getUserUpdate.and.returnValue(userUpdateObservable);

        let callbackCalled = false;
        service.subscribeToUserUpdate((user: UserConnectionUpdate) => {
            callbackCalled = true;
            expect(user).toEqual({ user: { username: 'Test', isConnected: true }, isConnected: true, username: 'Test' } as UserConnectionUpdate);
        });

        expect(websocketServiceMock.getUserUpdate).toHaveBeenCalled();
        expect(callbackCalled).toBeTruthy();
    });

    it('should subscribe to user stat updates', () => {
        const userStatObservable = of([{ username: 'Test', score: 100, bonus: 1, isConnected: true }] as UserStat[]);
        websocketServiceMock.getUsersStat.and.returnValue(userStatObservable);

        let callbackCalled = false;
        service.subscribeToUserStatUpdate((userStat: UserStat[]) => {
            callbackCalled = true;
            expect(userStat).toEqual([{ username: 'Test', score: 100, bonus: 1, isConnected: true }]);
        });

        expect(websocketServiceMock.getUsersStat).toHaveBeenCalled();
        expect(callbackCalled).toBeTruthy();
    });

    it('should subscribe to score updates', () => {
        const scoreObservable = of({ score: 20, bonus: false } as Score);
        websocketServiceMock.getScoreUpdate.and.returnValue(scoreObservable);

        let callbackCalled = false;
        service.subscribeToScoreUpdate((score: Score) => {
            callbackCalled = true;
            expect(score).toEqual({ score: 20, bonus: false });
        });

        expect(websocketServiceMock.getScoreUpdate).toHaveBeenCalled();
        expect(callbackCalled).toBeTruthy();
    });

    it('should subscribe to histogram data updates', () => {
        const histogramDataObservable = of({
            question: [
                {
                    type: QuestionType.QCM,
                    text: 'Question test',
                    points: 8,
                    choices: [
                        { text: 'A', isCorrect: true },
                        { text: 'B', isCorrect: false },
                        { text: 'C', isCorrect: false },
                    ],
                },
            ],
            indexCurrentQuestion: 0,
            choicesCounters: [
                [MOCK_CHOICES_COUNTER, 0, 0],
                [0, 0, MOCK_CHOICES_COUNTER],
            ],
        } as HistogramData);
        websocketServiceMock.getHistogramData.and.returnValue(histogramDataObservable);

        let callbackCalled = false;
        service.subscribeToHistogramData((data: HistogramData) => {
            callbackCalled = true;
            expect(data).toEqual({
                question: [
                    {
                        type: QuestionType.QCM,
                        text: 'Question test',
                        points: 8,
                        choices: [
                            { text: 'A', isCorrect: true },
                            { text: 'B', isCorrect: false },
                            { text: 'C', isCorrect: false },
                        ],
                    },
                ],
                indexCurrentQuestion: 0,
                choicesCounters: [
                    [MOCK_CHOICES_COUNTER, 0, 0],
                    [0, 0, MOCK_CHOICES_COUNTER],
                ],
            });
        });

        expect(websocketServiceMock.getHistogramData).toHaveBeenCalled();
        expect(callbackCalled).toBeTruthy();
    });
});
