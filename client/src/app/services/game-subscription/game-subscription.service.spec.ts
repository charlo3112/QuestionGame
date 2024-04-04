import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HISTOGRAM_DATA } from '@common/interfaces/histogram-data';
import { Score } from '@common/interfaces/score';
import { USER_GAME_INFO } from '@common/interfaces/user-game-info';
import { USER_CONNECTION_UPDATE } from '@common/interfaces/user-update';
import { of } from 'rxjs';
import { GameSubscriptionService } from './game-subscription.service';

describe('GameSubscriptionService', () => {
    let service: GameSubscriptionService;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;

    let mockTest: boolean;

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
        ]);
        websocketServiceSpy.getScore.and.returnValue(Promise.resolve({ score: 0, bonus: false }));
        websocketServiceSpy.getUsers.and.returnValue(Promise.resolve([]));

        websocketServiceSpy.getUsersStat.and.returnValue(of([]));
        websocketServiceSpy.getHistogramData.and.returnValue(of(HISTOGRAM_DATA));
        websocketServiceSpy.getAlert.and.returnValue(of(''));
        websocketServiceSpy.getUserGameInfo.and.returnValue(of(USER_GAME_INFO));
        websocketServiceSpy.getState.and.returnValue(of({ state: GameState.NotStarted, payload: '' }));
        websocketServiceSpy.getTime.and.returnValue(of(0));
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

    // describe('State Management', () => {
    //     it('updates state and navigates based on game state', () => {
    //         service.state = GameState.AskingQuestion;
    //         expect(service.state).toBe(GameState.AskingQuestion);
    //         service.state = GameState.ShowFinalResults;
    //         expect(routerSpy.navigate).toHaveBeenCalledWith(['/results']);
    //     });

    //     it('resets properties when game state is NotStarted', () => {
    //         service.state = GameState.NotStarted;
    //         expect(service.scoreValue).toBe(0);
    //         expect(service.choicesSelected.every((v) => !v)).toBeTrue();
    //     });
    // });

    describe('Subscriptions Initialization', () => {
        it('initializes with correct game state payload', async () => {
            const mockState: GameStatePayload = { state: GameState.Starting, payload: 'Game Title' };
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

    // describe('User and Score Management', () => {
    //     it('sorts users correctly', () => {
    //         service.usersStat = [
    //             { username: 'Alice', score: 100, state: 1 },
    //             { username: 'Bob', score: 200, state: 2 },
    //         ];
    //         service.sortOption = SortOption.ScoreDescending;
    //         service.sortUsers();
    //         expect(service.usersStat[0].username).toBe('Bob');
    //     });

    //     it('updates score from WebSocketService', () => {
    //         const mockScoreUpdate = { score: 10, bonus: false };
    //         websocketServiceSpy.getScoreUpdate.and.returnValue(of(mockScoreUpdate));
    //         expect(service.scoreValue).toBe(mockScoreUpdate.score);
    //         expect(service.showBonus).toBe(mockScoreUpdate.bonus);
    //     });
    // });

    // describe('WebSocket Updates', () => {
    // it('handles time updates from WebSocketService', () => {
    //     const timeUpdate = 123;
    //     websocketServiceSpy.getTime.and.returnValue(of(timeUpdate));
    //     service['subscribeToTimeUpdate']();
    //     expect(service.serverTime).toBe(timeUpdate);
    // });
    // it('handles user stat updates', () => {
    //     const usersStatUpdate: UserStat[] = [{ username: 'user1', score: 50, state: 2, canChat: true, bonus: 1 }];
    //     websocketServiceSpy.getUsersStat.and.returnValue(of(usersStatUpdate));
    //     service['subscribeToUsersStatUpdate']();
    //     expect(service.usersStat).toEqual(usersStatUpdate);
    // });
    // it('reacts to alert messages', () => {
    //     const alertMessage = 'Test alert';
    //     websocketServiceSpy.getAlert.and.returnValue(of(alertMessage));
    //     service['subscribeToAlert']();
    //     expect(snackBarSpy.open).toHaveBeenCalledWith(alertMessage, undefined, { duration: SNACKBAR_DURATION });
    // });
    // });

    describe('Destruction and Cleanup', () => {
        it('unsubscribes from all observables on ngOnDestroy', () => {
            spyOn(service['stateSubscription'], 'unsubscribe');
            spyOn(service['messagesSubscription'], 'unsubscribe');
            spyOn(service['timeSubscription'], 'unsubscribe');
            spyOn(service['scoreSubscription'], 'unsubscribe');
            spyOn(service['userSubscription'], 'unsubscribe');
            spyOn(service['usersStatSubscription'], 'unsubscribe');
            spyOn(service['histogramDataSubscription'], 'unsubscribe');
            spyOn(service['alertSubscription'], 'unsubscribe');
            spyOn(service['userGameInfoSubscription'], 'unsubscribe');
            service.ngOnDestroy();
            expect(service['stateSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['messagesSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['timeSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['scoreSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['userSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['usersStatSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['histogramDataSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['alertSubscription'].unsubscribe).toHaveBeenCalled();
            expect(service['userGameInfoSubscription'].unsubscribe).toHaveBeenCalled();
        });
    });
});
