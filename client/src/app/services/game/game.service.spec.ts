// We need to disable max-lines because we need every single test to test thoroughly the service and have a good coverage
/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimeService } from '@app/services/time/time.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME, MAX_TIME_RETURN, MOCK_CHOICES_COUNTER, SNACKBAR_DURATION, TIME_RETURN } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { GAME_PLACEHOLDER } from '@common/interfaces/game';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { of } from 'rxjs';
import { GameService } from './game.service';
import SpyObj = jasmine.SpyObj;

class TimeServiceStub {
    get time(): number {
        return 2;
    }
    startTimer(startValue: number, execute: () => void) {
        setTimeout(execute, 0);
    }
    // Necessary for unit tests where stubs with empty functions are needed to fulfill interfaces without implementing specific logic.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopTimer() {}
    setTimeout(execute: () => void, timeMs: number) {
        setTimeout(execute, timeMs);
    }
}

describe('Game', () => {
    let service: GameService;
    const timeService: TimeServiceStub = new TimeServiceStub();
    const mockRouter = {
        navigate: jasmine.createSpy('navigate'),
    };
    let snackBarSpy: SpyObj<MatSnackBar>;
    let webSocketSpy: SpyObj<WebSocketService>;
    let subscriptionServiceSpy: SpyObj<SubscriptionService>;
    let mockQuestion: Question;

    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        webSocketSpy = jasmine.createSpyObj('WebSocketService', [
            'leaveRoom',
            'rejoinRoom',
            'getScore',
            'getUsers',
            'nextQuestion',
            'showResults',
            'sendChoice',
            'validateChoice',
            'getTime',
            'getUserUpdate',
            'getUsersStat',
            'getState',
            'getClosedConnection',
            'getScoreUpdate',
            'isValidate',
            'getChoice',
            'banUser',
            'leaveRoom',
            'getHistogramData',
            'hostConfirm',
            'showFinalResults',
        ]);
        subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', [
            'subscribeToStateUpdate',
            'subscribeToScoreUpdate',
            'subscribeToUserUpdate',
            'subscribeToUserStatUpdate',
            'subscribeToHistogramData',
            'timerSubscribe',
            'stateSubscribe',
        ]);
        webSocketSpy.getState.and.returnValue(of({ state: GameState.Wait }));
        webSocketSpy.getTime.and.returnValue(of(TIME_RETURN));
        webSocketSpy.getUserUpdate.and.returnValue(of({ username: 'test', isConnected: true }));
        webSocketSpy.getUsersStat.and.returnValue(of([]));
        webSocketSpy.getClosedConnection.and.returnValue(of('Connection closed'));
        webSocketSpy.rejoinRoom.and.returnValue(Promise.resolve({ ok: true, value: { state: GameState.Wait, payload: undefined } }));
        webSocketSpy.getScore.and.returnValue(Promise.resolve({ score: 0, bonus: false }));
        const mockScoreUpdate: Score = { score: 0, bonus: false };
        webSocketSpy.getScoreUpdate.and.returnValue(of(mockScoreUpdate));
        webSocketSpy.getUsers.and.returnValue(Promise.resolve(['user1', 'user2', 'user3']));
        webSocketSpy.getHistogramData.and.returnValue(
            of({
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
            }),
        );
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                GameService,
                { provide: Router, useValue: mockRouter },
                { provide: TimeService, useValue: timeService },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: WebSocketService, useValue: webSocketSpy },
                { provide: SubscriptionService, useValue: subscriptionServiceSpy },
            ],
        });
        service = TestBed.inject(GameService);
        subscriptionServiceSpy = TestBed.inject(SubscriptionService) as jasmine.SpyObj<SubscriptionService>;
        const mockUser = { name: 'John Doe', roomId: '2222', userId: 'user123' };
        sessionStorage.setItem('user', JSON.stringify(mockUser));
        mockQuestion = {
            text: 'Quelle est la capitale de la France ?',
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'Lyon', isCorrect: false },
                { text: 'Marseille', isCorrect: false },
            ],
            type: QuestionType.QCM,
            points: 1,
        };
    });

    afterEach(() => {
        sessionStorage.clear();
        jasmine.getEnv().allowRespy(true);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return false when the choice is not selected', () => {
        expect(service.isChoiceSelected(0)).toBeFalsy();
    });

    it('should not return a question when GameState is not AskingQuestion or ShowResults', () => {
        service['state'] = GameState.GameOver;
        expect(service.currentQuestion).toBeUndefined();
    });

    it('should return the state of the game', () => {
        service.reset();
        expect(service.currentState).toEqual(GameState.NotStarted);
    });

    it('should return the current question', () => {
        service['question'] = structuredClone(GAME_PLACEHOLDER).questions[0];
        expect(service.currentQuestion).toEqual(structuredClone(GAME_PLACEHOLDER).questions[0]);
    });

    it('should return the current question when GameState is ShowResults', () => {
        const currentQuestion = structuredClone(GAME_PLACEHOLDER).questions[0];
        service['question'] = currentQuestion;
        service['state'] = GameState.ShowResults;
        expect(service.currentQuestion).toEqual(currentQuestion);
    });

    it('should return undefined when there is no bonus', () => {
        expect(service.message).toBeUndefined();
    });

    it('should return false when the choice is not correct', () => {
        expect(service.isChoiceCorrect(0)).toBeFalsy();
    });

    it('should return true when the choice is correct', () => {
        const correctQuestion: Question = {
            ...GAME_PLACEHOLDER.questions[0],
            choices: GAME_PLACEHOLDER.questions[0].choices.map((choice, index) => ({
                ...choice,
                isCorrect: index === 0,
            })),
        };
        service['question'] = correctQuestion;
        service['state'] = GameState.ShowResults;
        service.selectChoice(0);
        expect(service.isChoiceCorrect(0)).toBeTruthy();
    });

    it('should return false when the state is not show results', () => {
        expect(service.isChoiceIncorrect(0)).toBeFalsy();
    });

    it('should return false when the choice is correct', () => {
        service.selectChoice(0);
        service['state'] = GameState.ShowResults;
        expect(service.isChoiceIncorrect(0)).toBeFalsy();
    });

    it('should return true when the choice is selected and incorrect', () => {
        const questionWithIncorrectChoice: Question = {
            type: QuestionType.QCM,
            text: "Pourquoi le jus de lichi n'est pas bon?",
            points: 69,
            choices: [
                { text: 'Guillaume en boit', isCorrect: true },
                { text: 'Guillaume en a apporté 2 boites', isCorrect: true },
                { text: "C'est du lichi", isCorrect: false },
                { text: 'Guillaume en a bu à 9h du matin', isCorrect: true },
            ],
        };
        service['question'] = questionWithIncorrectChoice;
        service['state'] = GameState.ShowResults;
        service.selectChoice(2);
        expect(service.isChoiceIncorrect(2)).toBeTruthy();
    });

    it('should not allow to select choice when the state is not asking question', () => {
        service['state'] = GameState.ShowResults;
        service.selectChoice(0);
        expect(service['choicesSelected'][0]).toBeFalsy();
    });

    it('should allow to select choice when the state is asking question', () => {
        service['state'] = GameState.AskingQuestion;
        service.selectChoice(0);
        expect(service['choicesSelected'][0]).toBeTruthy();
    });

    it('should not confirm a question when the state is not AskingQuestion', () => {
        service['state'] = GameState.GameOver;
        service.confirmQuestion();
        expect(service.currentState).not.toBe(GameState.ShowResults);
    });

    it('should confirm a question', () => {
        service['state'] = GameState.AskingQuestion;
        service.confirmQuestion();
        expect(webSocketSpy.validateChoice).toHaveBeenCalled();
    });

    it('should return the same time as timeService', () => {
        expect(service.time).toEqual(TIME_RETURN);
    });

    it('should return 0 at the start of the game', () => {
        expect(service.score).toEqual(0);
    });

    it('should return the max time of the game', () => {
        expect(service.maxTime).toEqual(MAX_TIME_RETURN);
    });

    it('should return the current game title', () => {
        const expectedTitle = 'Titre du Jeu Test';
        service['title'] = expectedTitle;
        expect(service.gameTitle).toEqual(expectedTitle);
    });

    it('should return the current room code value', () => {
        const expectedRoomCode = '2323';
        service['roomCode'] = expectedRoomCode;
        expect(service.roomCodeValue).toEqual(expectedRoomCode);
    });

    it('should return the max time (20) of the game', () => {
        expect(service.maxTime).toEqual(MAX_TIME_RETURN);
    });

    it('should return the current game title', () => {
        const expectedTitle = 'Titre du Jeu Test';
        service['title'] = expectedTitle;
        expect(service.gameTitle).toEqual(expectedTitle);
    });

    it('should return the current room code value', () => {
        const expectedRoomCode = '2323';
        service['roomCode'] = expectedRoomCode;
        expect(service.roomCodeValue).toEqual(expectedRoomCode);
    });

    it('should return true if the username is HOST_NAME', () => {
        service['username'] = HOST_NAME;
        expect(service.isHost).toBeTruthy();
    });

    it('should return false if the username is not HOST_NAME', () => {
        service['username'] = 'guest';
        expect(service.isHost).toBeFalsy();
    });

    it('should return the list of players', () => {
        const players = new Set<string>(['player1', 'player2', 'player3']);
        service['players'] = players;
        expect(service.playersList).toEqual(players);
    });

    it('should navigate to root if no user data is found in sessionStorage', fakeAsync(() => {
        spyOn(sessionStorage, 'getItem').and.returnValue(null);
        service.init();
        tick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should navigate to root and show snackBar if rejoinRoom fails', fakeAsync(() => {
        const mockUser = { name: 'John Doe', roomId: 'room123', userId: 'user123' };
        spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
        webSocketSpy.rejoinRoom.and.returnValue(Promise.resolve({ ok: false, error: 'Error joining room' }));
        service.init();
        tick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        expect(snackBarSpy.open).toHaveBeenCalledWith('Error joining room', undefined, { duration: SNACKBAR_DURATION });
    }));

    it('should set username based on user data from sessionStorage', async () => {
        await service.init();
        expect(service.usernameValue).toEqual('John Doe');
    });

    it('should change state to waiting result in init', async () => {
        webSocketSpy.rejoinRoom.and.returnValue(Promise.resolve({ ok: true, value: { state: GameState.AskingQuestion, payload: undefined } }));
        webSocketSpy.isValidate.and.returnValue(Promise.resolve(true));
        await service.init();
        expect(service.currentState).toEqual(GameState.AskingQuestion);
    });

    it('should remove player from players list and call banUser on websocketService', () => {
        const player = 'playerName';
        service['players'] = new Set(['player1', player, 'player3']);
        service.onKickPlayer(player);
        expect(service['players'].has(player)).toBeFalse();
        expect(webSocketSpy.banUser).toHaveBeenCalled();
    });

    it('should call leaveRoom, remove user from sessionStorage, and call reset when state is not Starting', () => {
        service['state'] = GameState.AskingQuestion;
        spyOn(sessionStorage, 'removeItem');
        spyOn(service, 'reset');
        service.leaveRoom();
        expect(webSocketSpy.leaveRoom).toHaveBeenCalled();
        expect(sessionStorage.removeItem).toHaveBeenCalledWith('user');
        expect(service.reset).toHaveBeenCalled();
    });

    it('should return false when question is undefined', () => {
        service['state'] = GameState.ShowResults;
        service['question'] = undefined;
        const result = service.isChoiceCorrect(0);
        expect(result).toBeFalse();
    });

    it('should set the state to WaintingResults', () => {
        service['state'] = GameState.AskingQuestion;
        service.confirmQuestion();
        expect(service.currentState).toEqual(GameState.WaitingResults);
    });

    // We did not manage to test the timerSubscribe function with fakeAsync and tick, nor did we
    // manage to remove DoneFn like we did on the "timerSubscribe should return the time Observable" test
    // eslint-disable-next-line no-undef
    // it('timerSubscribe should return the time Observable', (done: DoneFn) => {
    //     service.timerSubscribe().subscribe((time) => {
    //         expect(time).toEqual(TIME_RETURN);
    //         done();
    //     });
    // });

    it('timerSubscribe should call timerSubscribe on SubscriptionService', () => {
        service.timerSubscribe();
        expect(subscriptionServiceSpy.timerSubscribe).toHaveBeenCalled();
    });

    it('should return false when no question is set', () => {
        expect(service['isResponseGood']()).toBeFalsy();
    });

    it('should return true when the selected choices are correct', () => {
        service['question'] = mockQuestion;
        service['choicesSelected'] = [true, false, false];
        expect(service['isResponseGood']()).toBeTruthy();
    });

    it('should return false when the selected choices are incorrect', () => {
        service['question'] = mockQuestion;
        service['choicesSelected'] = [false, true, false];
        expect(service['isResponseGood']()).toBeFalsy();
    });

    it('should assign question when state is AskingQuestion with payload', () => {
        service['setState']({ state: GameState.AskingQuestion, payload: mockQuestion });
        expect(service['question']).toEqual(mockQuestion);
        expect(service['choicesSelected']).toEqual([false, false, false, false]);
    });

    it('should update title when state is Starting', () => {
        const title = 'New Game Title';
        service['setState']({ state: GameState.Starting, payload: title });
        expect(service['title']).toEqual(title);
    });
    it('nextQuestion() should call hostConfirm on WebSocketService', () => {
        service.nextQuestion();
        expect(webSocketSpy.hostConfirm).toHaveBeenCalled();
    });
    it('showFinalResults() should call showFinalResults on WebSocketService', () => {
        service.showFinalResults();
        expect(webSocketSpy.showFinalResults).toHaveBeenCalled();
    });

    it('should navigate to /results if state is ShowFinalResults and current url is not /results', fakeAsync(() => {
        service['state'] = GameState.ShowFinalResults;
        service['setState']({ state: GameState.ShowFinalResults, payload: undefined });
        const navigateSpy = spyOn(service['routerService'], 'navigate');
        expect(navigateSpy).toHaveBeenCalledWith(['/results']);
    }));

    it('should return undefined when state is not ShowResults or bonus is false', () => {
        service['state'] = GameState.NotStarted;
        service['showBonus'] = false;
        const message = service.message;
        expect(message).toBeUndefined();
    });

    it('setState() should set the state and payload', () => {
        const state = GameState.ShowResults;
        const payload = 'payload';
        service['setState']({ state, payload });
        expect(service['state']).toEqual(state);
    });

    it('should return if game state is not started', () => {
        service['state'] = GameState.NotStarted;
        service['setState']({ state: GameState.NotStarted, payload: undefined });
        expect(service['state']).toEqual(GameState.NotStarted);
    });

    // it('should update score and bonus on score update', () => {
    //     const scoreUpdate = { score: 100, bonus: true };
    //     const scoreObservable = of(scoreUpdate);
    //     subscriptionServiceSpy.subscribeToScoreUpdate.and.returnValue(scoreObservable);

    //     service['subscribeToScoreUpdate']();

    //     expect(service['scoreValue']).toEqual(scoreUpdate.score);
    //     expect(service['showBonus']).toEqual(scoreUpdate.bonus);
    // });
});
