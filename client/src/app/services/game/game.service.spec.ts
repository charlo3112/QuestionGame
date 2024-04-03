// We need to disable max-lines because we need every single test to test thoroughly the service and have a good coverage
/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { routes } from '@app/modules/app-routing.module';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME, MAX_TIME_RETURN, MOCK_CHOICES_COUNTER, TIME_RETURN } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { GAME_PLACEHOLDER } from '@common/interfaces/game';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { of } from 'rxjs';
import { GameService } from './game.service';
import SpyObj = jasmine.SpyObj;

describe('Game', () => {
    let service: GameService;
    let webSocketSpy: SpyObj<WebSocketService>;
    let mockQuestion: Question;
    let gameSubSpy: SpyObj<GameSubscriptionService>;
    let mockState: GameState = GameState.NotStarted;
    let sessionStorageServiceSpy: SpyObj<SessionStorageService>;
    let snackSpy: jasmine.SpyObj<MatSnackBar>;
    let routerSpy: jasmine.SpyObj<Router>;

    let mockUsername = 'user123';
    let mockRoomId = 'room123';
    const mockPlay = true;

    beforeEach(() => {
        snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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

        sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['initUser', 'removeUser'], ['play', 'username', 'roomId']);
        Object.defineProperty(sessionStorageServiceSpy, 'play', {
            get: jasmine.createSpy('play.get').and.callFake(() => mockPlay),
        });
        Object.defineProperty(sessionStorageServiceSpy, 'username', {
            get: jasmine.createSpy('username.get').and.callFake(() => mockUsername),
        });
        Object.defineProperty(sessionStorageServiceSpy, 'roomId', {
            get: jasmine.createSpy('roomId.get').and.callFake(() => mockRoomId),
        });

        gameSubSpy = jasmine.createSpyObj('GameSubscriptionService', ['initSubscriptions', 'reset']);
        gameSubSpy.serverTime = 0;
        gameSubSpy.showBonus = false;
        gameSubSpy.scoreValue = 0;
        gameSubSpy.players = new Set();
        gameSubSpy.histogramData = { question: [], indexCurrentQuestion: 0, choicesCounters: [] };
        gameSubSpy.usersStat = [];
        gameSubSpy.question = undefined;
        gameSubSpy.choicesSelected = [false, false, false, false];
        Object.defineProperty(gameSubSpy, 'state', {
            get: jasmine.createSpy('state.get').and.callFake(() => mockState),
            set: jasmine.createSpy('state.set').and.callFake((value) => {
                mockState = value;
            }),
        });

        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterModule.forRoot(routes)],
            providers: [
                GameService,
                { provide: GameSubscriptionService, useValue: gameSubSpy },
                { provide: WebSocketService, useValue: webSocketSpy },
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
                { provide: MatSnackBar, useValue: snackSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(GameService);

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
        gameSubSpy.state = GameState.GameOver;
        expect(service.currentQuestion).toBeUndefined();
    });

    it('should return the state of the game', () => {
        service.reset();
        gameSubSpy.state = GameState.NotStarted;
        expect(service.currentState).toEqual(GameState.NotStarted);
    });

    it('should return the current question', () => {
        gameSubSpy.question = structuredClone(GAME_PLACEHOLDER).questions[0];
        expect(service.currentQuestion).toEqual(structuredClone(GAME_PLACEHOLDER).questions[0]);
    });

    it('should return the current question when GameState is ShowResults', () => {
        const currentQuestion = structuredClone(GAME_PLACEHOLDER).questions[0];
        gameSubSpy.question = currentQuestion;
        gameSubSpy.state = GameState.ShowResults;
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
        gameSubSpy.question = correctQuestion;
        gameSubSpy.state = GameState.ShowResults;
        service.selectChoice(0);
        expect(service.isChoiceCorrect(0)).toBeTruthy();
    });

    it('should return false when the state is not show results', () => {
        expect(service.isChoiceIncorrect(0)).toBeFalsy();
    });

    it('should return false when the choice is correct', () => {
        service.selectChoice(0);
        gameSubSpy.state = GameState.ShowResults;
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
        gameSubSpy.question = questionWithIncorrectChoice;
        gameSubSpy.state = GameState.ShowResults;
        service.selectChoice(2);
        expect(service.isChoiceIncorrect(2)).toBeTruthy();
    });

    it('should not allow to select choice when the state is not asking question', () => {
        gameSubSpy.state = GameState.ShowResults;
        service.selectChoice(0);
        expect(gameSubSpy.choicesSelected[0]).toBeFalsy();
    });

    it('should allow to select choice when the state is asking question', () => {
        gameSubSpy.state = GameState.AskingQuestion;
        service.selectChoice(0);
        expect(gameSubSpy.choicesSelected[0]).toBeTruthy();
    });

    it('should not confirm a question when the state is not AskingQuestion', () => {
        gameSubSpy.state = GameState.GameOver;
        service.confirmQuestion();
        expect(service.currentState).not.toBe(GameState.ShowResults);
    });

    it('should confirm a question', () => {
        gameSubSpy.state = GameState.AskingQuestion;
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
        gameSubSpy.title = expectedTitle;
        expect(service.gameTitle).toEqual(expectedTitle);
    });

    it('should return the current room code value', () => {
        const expectedRoomCode = '2323';
        mockRoomId = expectedRoomCode;
        expect(service.roomCodeValue).toEqual(expectedRoomCode);
    });

    it('should return the max time (20) of the game', () => {
        expect(service.maxTime).toEqual(MAX_TIME_RETURN);
    });

    it('should return the current game title', () => {
        const expectedTitle = 'Titre du Jeu Test';
        gameSubSpy.title = expectedTitle;
        expect(service.gameTitle).toEqual(expectedTitle);
    });

    it('should return the current room code value', () => {
        const expectedRoomCode = '2323';
        mockRoomId = expectedRoomCode;
        expect(service.roomCodeValue).toEqual(expectedRoomCode);
    });

    it('should return true if the username is HOST_NAME', () => {
        mockUsername = HOST_NAME;
        expect(service.isHost).toBeTruthy();
    });

    it('should return false if the username is not HOST_NAME', () => {
        mockUsername = 'guest';
        expect(service.isHost).toBeFalsy();
    });

    it('should return the list of players', () => {
        const players = new Set<string>(['player1', 'player2', 'player3']);
        gameSubSpy.players = players;
        expect(service.playersList).toEqual(players);
    });

    it('should call init sub if init of session storage is successful', async () => {
        sessionStorageServiceSpy.initUser.and.returnValue(
            Promise.resolve({ ok: true, value: { state: GameState.AskingQuestion, payload: undefined } }),
        );
        await service.init();
        expect(gameSubSpy.initSubscriptions).toHaveBeenCalled();
    });

    it('should not call init sub if init of session storage is not successful', async () => {
        sessionStorageServiceSpy.initUser.and.returnValue(Promise.resolve({ ok: false, error: 'Error' }));
        await service.init();
        expect(gameSubSpy.initSubscriptions).not.toHaveBeenCalled();
    });

    it('should call leaveRoom, remove user from sessionStorage, and call reset when state is not Starting', () => {
        gameSubSpy.state = GameState.AskingQuestion;
        service.leaveRoom();
        expect(webSocketSpy.leaveRoom).toHaveBeenCalled();
        expect(sessionStorageServiceSpy.removeUser).toHaveBeenCalled();
        expect(gameSubSpy.reset).toHaveBeenCalled();
    });

    it('should return false when question is undefined', () => {
        gameSubSpy.state = GameState.ShowResults;
        gameSubSpy.question = undefined;
        const result = service.isChoiceCorrect(0);
        expect(result).toBeFalse();
    });

    it('should set the state to WaintingResults', () => {
        gameSubSpy.state = GameState.AskingQuestion;
        service.confirmQuestion();
        expect(service.currentState).toEqual(GameState.WaitingResults);
    });

    it('should return false when no question is set', () => {
        expect(service['isResponseGood']()).toBeFalsy();
    });

    it('should return true when the selected choices are correct', () => {
        gameSubSpy.question = mockQuestion;
        gameSubSpy.choicesSelected = [true, false, false];
        expect(service['isResponseGood']()).toBeTruthy();
    });

    it('should return false when the selected choices are incorrect', () => {
        gameSubSpy.question = mockQuestion;
        gameSubSpy.choicesSelected = [false, true, false];
        expect(service['isResponseGood']()).toBeFalsy();
    });

    it('nextQuestion() should call hostConfirm on WebSocketService', () => {
        service.nextQuestion();
        expect(webSocketSpy.hostConfirm).toHaveBeenCalled();
    });
    it('showFinalResults() should call showFinalResults on WebSocketService', () => {
        service.showFinalResults();
        expect(webSocketSpy.showFinalResults).toHaveBeenCalled();
    });

    it('timerSubscribe should return the time Observable', (done) => {
        service.timerSubscribe().subscribe((time) => {
            expect(time).toEqual(TIME_RETURN);
            done();
        });
    });

    it('should return undefined when state is not ShowResults or bonus is false', () => {
        gameSubSpy.state = GameState.NotStarted;
        gameSubSpy.showBonus = false;
        const message = service.message;
        expect(message).toBeUndefined();
    });
});
