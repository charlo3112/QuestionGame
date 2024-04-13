import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { SortOption } from '@common/enums/sort-option';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HISTOGRAM_DATA } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { TIME_DATA } from '@common/interfaces/time-data';
import { USER_GAME_INFO } from '@common/interfaces/user-game-info';
import { USER_CONNECTION_UPDATE, USER_CONNECTION_UPDATE2 } from '@common/interfaces/user-update';
import { of } from 'rxjs';
import { GameSubscriptionService } from './game-subscription.service';

describe('GameSubscriptionService', () => {
    let service: GameSubscriptionService;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;

    let mockTest: boolean;

    const mockQrlAnswer: QrlAnswer = {
        player: 'testplayer',
        text: 'Exemple de réponse',
        grade: Grade.Ungraded,
    };
    const mockQrlResultData: Record<number, QrlAnswer[]> = {
        // We need to have this value in the dictionary to make the test run
        // eslint-disable-next-line @typescript-eslint/naming-convention
        0: [mockQrlAnswer],
    };

    beforeEach(() => {
        sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['test']);
        Object.defineProperty(sessionStorageServiceSpy, 'test', {
            get: jasmine.createSpy('test.get').and.callFake(() => mockTest),
        });
        mockTest = false;

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        websocketServiceSpy = jasmine.createSpyObj('WebSocketService', [
            'rejoinRoom',
            'getScore',
            'getUsers',
            'getTime',
            'getClosedConnection',
            'getState',
            'getScoreUpdate',
            'getUserUpdate',
            'getUsersStat',
            'getHistogramData',
            'getAlert',
            'getUserGameInfo',
            'getQrlGradedAnswers',
            'getQrlResultData',
        ]);
        websocketServiceSpy.getQrlGradedAnswers.and.returnValue(of(mockQrlAnswer));
        websocketServiceSpy.getQrlResultData.and.returnValue(of(mockQrlResultData));
        websocketServiceSpy.getScore.and.returnValue(Promise.resolve({ score: 0, bonus: false }));
        websocketServiceSpy.getUsers.and.returnValue(Promise.resolve([]));
        websocketServiceSpy.getUsersStat.and.returnValue(of([]));
        websocketServiceSpy.getHistogramData.and.returnValue(of(HISTOGRAM_DATA));
        websocketServiceSpy.getAlert.and.returnValue(of(''));
        websocketServiceSpy.getUserGameInfo.and.returnValue(of(USER_GAME_INFO));
        websocketServiceSpy.getState.and.returnValue(of({ state: GameState.NOT_STARTED, payload: '' }));
        websocketServiceSpy.getTime.and.returnValue(of(TIME_DATA));
        websocketServiceSpy.getClosedConnection.and.returnValue(of(''));
        websocketServiceSpy.getUserUpdate.and.returnValue(of(USER_CONNECTION_UPDATE));
        websocketServiceSpy.getScoreUpdate.and.returnValue(of({ score: 0, bonus: false }));

        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            providers: [
                GameSubscriptionService,
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: websocketServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
            ],
        });

        service = TestBed.inject(GameSubscriptionService);
    });

    describe('Subscriptions Initialization', () => {
        it('initializes with correct game state payload', async () => {
            const mockState: GameStatePayload = { state: GameState.STARTING, payload: 'Game Title' };
            const mockScore: Score = { score: 5, bonus: false };
            websocketServiceSpy.getScore.and.returnValue(Promise.resolve(mockScore));
            websocketServiceSpy.getUsers.and.returnValue(Promise.resolve(['user1']));
            await service.initSubscriptions(mockState);
            expect(service.title).toEqual('Game Title');
            expect(service.players.size).toBe(1);
            expect(service.scoreValue).toBe(mockScore.score);
            expect(service.showBonus).toBe(mockScore.bonus);
        });
    });

    describe('sort users', () => {
        it('sorts users correctly', () => {
            service.usersStat = [
                { username: 'Alice', score: 100, state: 1, canChat: true, bonus: 0 },
                { username: 'Bob', score: 200, state: 2, canChat: true, bonus: 0 },
                { username: 'ken', score: 200, state: 2, canChat: true, bonus: 0 },
            ];
            service.sortOption = SortOption.USERNAME_ASCENDING;
            service.sortUsers();
            expect(service.usersStat[0].username).toBe('Alice');
        });

        it('sorts users correctly', () => {
            service.usersStat = [
                { username: 'Alice', score: 100, state: 1, canChat: true, bonus: 0 },
                { username: 'Bob', score: 200, state: 2, canChat: true, bonus: 0 },
                { username: 'ken', score: 200, state: 2, canChat: true, bonus: 0 },
            ];
            service.sortOption = SortOption.USERNAME_DESCENDING;
            service.sortUsers();
            expect(service.usersStat[0].username).toBe('ken');
        });

        it('sorts users correctly', () => {
            service.usersStat = [
                { username: 'Alice', score: 100, state: 1, canChat: true, bonus: 0 },
                { username: 'Bob', score: 200, state: 2, canChat: true, bonus: 0 },
                { username: 'ken', score: 200, state: 2, canChat: true, bonus: 0 },
            ];
            service.sortOption = SortOption.SCORE_ASCENDING;
            service.sortUsers();
            expect(service.usersStat[0].username).toBe('Alice');
        });

        it('sorts users correctly', () => {
            service.usersStat = [
                { username: 'Alice', score: 100, state: 1, canChat: true, bonus: 0 },
                { username: 'Bob', score: 200, state: 2, canChat: true, bonus: 0 },
                { username: 'ken', score: 200, state: 2, canChat: true, bonus: 0 },
            ];
            service.sortOption = SortOption.SCORE_DESCENDING;
            service.sortUsers();
            expect(service.usersStat[0].username).toBe('Bob');
        });

        it('sorts users correctly', () => {
            service.usersStat = [
                { username: 'Alice', score: 100, state: 1, canChat: true, bonus: 0 },
                { username: 'Bob', score: 200, state: 2, canChat: true, bonus: 0 },
                { username: 'ken', score: 200, state: 2, canChat: true, bonus: 0 },
            ];
            service.sortOption = SortOption.STATE_ASCENDING;
            service.sortUsers();
            expect(service.usersStat[0].username).toBe('Alice');
        });

        it('sorts users correctly', () => {
            service.usersStat = [
                { username: 'Alice', score: 100, state: 1, canChat: true, bonus: 0 },
                { username: 'Bob', score: 200, state: 2, canChat: true, bonus: 0 },
                { username: 'ken', score: 200, state: 2, canChat: true, bonus: 0 },
            ];
            service.sortOption = SortOption.STATE_DESCENDING;
            service.sortUsers();
            expect(service.usersStat[0].username).toBe('Bob');
        });
    });

    it('should redirect when closed connection', () => {
        websocketServiceSpy.getClosedConnection.and.returnValue(of(''));
        service['subscribeToClosedConnection']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        websocketServiceSpy.getClosedConnection.and.returnValue(of(''));
        mockTest = true;
        service['subscribeToClosedConnection']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/new']);
    });

    it('should update players on user update', () => {
        websocketServiceSpy.getUserUpdate.and.returnValue(of(USER_CONNECTION_UPDATE));
        service['subscribeToUserUpdate']();
        expect(service.players.size).toBe(1);
        websocketServiceSpy.getUserUpdate.and.returnValue(of(USER_CONNECTION_UPDATE2));
        service['subscribeToUserUpdate']();
        expect(service.players.size).toBe(0);
    });

    describe('state subscription', () => {
        it('should navigate to /loading when game state is Wait', () => {
            websocketServiceSpy.getState.and.returnValue(of({ state: GameState.WAIT, payload: '' }));
            service['subscribeToStateUpdate']();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/loading']);
        });

        it('should navigate to /results when game state is SHOW_FINAL_RESULTS', () => {
            websocketServiceSpy.getState.and.returnValue(of({ state: GameState.SHOW_FINAL_RESULTS, payload: '' }));
            service['subscribeToStateUpdate']();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/results']);
        });

        it('should navigate to /game when game state is ASKING_QUESTION', () => {
            const questionPayload: GameStatePayload = {
                state: GameState.ASKING_QUESTION,
                payload: QUESTION_PLACEHOLDER,
            };
            websocketServiceSpy.getState.and.returnValue(of(questionPayload));
            service['subscribeToStateUpdate']();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
            expect(service.question).toEqual(QUESTION_PLACEHOLDER);
        });

        it('should navigate to /game when game state is LAST_QUESTION', () => {
            websocketServiceSpy.getState.and.returnValue(of({ state: GameState.LAST_QUESTION, payload: QUESTION_PLACEHOLDER }));
            service['subscribeToStateUpdate']();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
            expect(service.question).toEqual(QUESTION_PLACEHOLDER);
        });

        it('should navigate to /game when game state is SHOW_RESULTS', () => {
            websocketServiceSpy.getState.and.returnValue(of({ state: GameState.SHOW_RESULTS, payload: QUESTION_PLACEHOLDER }));
            service['subscribeToStateUpdate']();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
            expect(service.question).toEqual(QUESTION_PLACEHOLDER);
        });

        it('should navigate to / when game state is NOT_STARTED', () => {
            websocketServiceSpy.getState.and.returnValue(of({ state: GameState.NOT_STARTED, payload: '' }));
            spyOn(service, 'reset');
            service['subscribeToStateUpdate']();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
            expect(service.reset).toHaveBeenCalled();
        });
    });

    describe('Destruction and Cleanup', () => {
        it('unsubscribes from all observables on ngOnDestroy', () => {
            spyOn(service['stateSubscription'], 'unsubscribe');
            spyOn(service['messagesSubscription'], 'unsubscribe');
            spyOn(service['scoreSubscription'], 'unsubscribe');
            spyOn(service['userSubscription'], 'unsubscribe');
            spyOn(service['usersStatSubscription'], 'unsubscribe');
            spyOn(service['histogramDataSubscription'], 'unsubscribe');
            spyOn(service['alertSubscription'], 'unsubscribe');
            spyOn(service['userGameInfoSubscription'], 'unsubscribe');
            service.ngOnDestroy();
            expect(service['stateSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['messagesSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['scoreSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['userSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['usersStatSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['histogramDataSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['alertSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['userGameInfoSubscription'].unsubscribe).toHaveBeenCalled();
        });
    });
});
