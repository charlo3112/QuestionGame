/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SortOption } from '@app/enums/sort-option';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GAME_PLACEHOLDER, Game } from '@common/interfaces/game';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HISTOGRAM_DATA } from '@common/interfaces/histogram-data';
import { QUESTION_PLACEHOLDER, Question } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';
import { USER, User } from '@common/interfaces/user';
import { USERS } from '@common/interfaces/user-stat';
import { of } from 'rxjs';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    let mockSessionStorageService: jasmine.SpyObj<SessionStorageService>;
    let mockGameSubscriptionService: jasmine.SpyObj<GameSubscriptionService>;
    let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
    let mockRouter: jasmine.SpyObj<Router>;

    let mockUsername: string;
    let mockRoomCode: string;
    let mockPlay: boolean;

    beforeEach(() => {
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', [
            'getTime',
            'getState',
            'createRoom',
            'startRandom',
            'testGame',
            'startTest',
            'leaveRoom',
            'setChat',
            'banUser',
            'sendChoice',
            'validateChoice',
            'hostConfirm',
            'showFinalResults',
        ]);
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['getGameByID']);
        mockSessionStorageService = jasmine.createSpyObj('SessionStorageService', ['initUser', 'removeUser', 'username', 'roomId', 'play']);
        Object.defineProperty(mockSessionStorageService, 'username', {
            get: jasmine.createSpy('username.get').and.callFake(() => mockUsername),
        });
        mockUsername = 'user';
        Object.defineProperty(mockSessionStorageService, 'roomId', {
            get: jasmine.createSpy('roomId.get').and.callFake(() => mockRoomCode),
        });
        mockRoomCode = 'roomCode';
        Object.defineProperty(mockSessionStorageService, 'play', {
            get: jasmine.createSpy('play.get').and.callFake(() => mockPlay),
        });
        mockPlay = true;

        mockGameSubscriptionService = jasmine.createSpyObj('GameSubscriptionService', ['initSubscriptions', 'reset', 'sortUsers']);
        mockGameSubscriptionService.sortOption = SortOption.UsernameAscending;
        mockGameSubscriptionService.choicesSelected = [false, false, false, false];
        mockGameSubscriptionService.players = new Set();

        mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                GameService,
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: CommunicationService, useValue: mockCommunicationService },
                { provide: SessionStorageService, useValue: mockSessionStorageService },
                { provide: GameSubscriptionService, useValue: mockGameSubscriptionService },
                { provide: MatSnackBar, useValue: mockSnackBar },
                { provide: Router, useValue: mockRouter },
            ],
        });

        gameService = TestBed.inject(GameService);
    });

    describe('Utility Methods', () => {
        it('should get the correct game title', () => {
            mockGameSubscriptionService.title = 'Game Title';
            expect(gameService.gameTitle).toEqual('Game Title');
        });

        it('should get the correct score', () => {
            const score = 10;
            mockGameSubscriptionService.scoreValue = score;
            expect(gameService.score).toEqual(score);
        });

        it('should get isPlaying', () => {
            mockPlay = true;
            expect(gameService.isPlaying).toBeTrue();
            mockPlay = false;
            expect(gameService.isPlaying).toBeFalse();
        });

        it('should get time', () => {
            const time = 10;
            mockGameSubscriptionService.serverTime = time;
            expect(gameService.time).toEqual(time);
        });

        it('should get isValidate', () => {
            mockGameSubscriptionService.isValidate = true;
            expect(gameService.isValidationDisabled).toBeTrue();
        });

        it('should get the max time', () => {
            const twenty = 20;
            expect(gameService.maxTime).toEqual(twenty);
        });

        it('should get users stat', () => {
            mockGameSubscriptionService.usersStat = USERS;
            expect(gameService.usersStat).toEqual(USERS);
        });

        it('should get the correct game state', () => {
            mockGameSubscriptionService.state = GameState.NotStarted;
            expect(gameService.currentState).toEqual(GameState.NotStarted);
        });

        describe('currentQuestion', () => {
            it('should return undefined if the state is not AskingQuestion or ShowResults or LastQuestion', () => {
                mockGameSubscriptionService.state = GameState.NotStarted;
                expect(gameService.currentQuestion).toBeUndefined();

                mockGameSubscriptionService.state = GameState.Starting;
                expect(gameService.currentQuestion).toBeUndefined();
            });

            it('should return the current question if the state is AskingQuestion', () => {
                mockGameSubscriptionService.state = GameState.AskingQuestion;
                mockGameSubscriptionService.question = QUESTION_PLACEHOLDER;
                expect(gameService.currentQuestion).toEqual(QUESTION_PLACEHOLDER);
            });
        });

        describe('message', () => {
            it('should return undefined if state is not ShowResults', () => {
                mockGameSubscriptionService.state = GameState.AskingQuestion;
                expect(gameService.message).toBeUndefined();
            });

            it('should return "Vous avez un bonus!" if state is ShowResults, isResponseGood returns true, and showBonus is true', () => {
                mockGameSubscriptionService.state = GameState.ShowResults;
                mockGameSubscriptionService.question = {
                    text: 'Question text',
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                        { text: 'Choice 3', isCorrect: false },
                        { text: 'Choice 4', isCorrect: false },
                    ],
                } as Question;
                mockGameSubscriptionService.choicesSelected = [true, false, false, false];
                mockGameSubscriptionService.showBonus = true;
                expect(gameService.message).toEqual('Vous avez un bonus!');
            });
        });

        it('should get the histogram data', () => {
            mockGameSubscriptionService.histogramData = HISTOGRAM_DATA;
            expect(gameService.histogram).toEqual(HISTOGRAM_DATA);
        });

        it('should get the username', () => {
            mockUsername = 'user';
            expect(gameService.usernameValue).toEqual('user');
        });

        it('should get room code value', () => {
            mockRoomCode = 'roomCode';
            expect(gameService.roomCodeValue).toEqual('roomCode');
        });

        it('should correctly determine if the player is the host', () => {
            mockUsername = HOST_NAME;
            expect(gameService.isHost).toBeTrue();
            mockUsername = 'user';
            expect(gameService.isHost).toBeFalse();
        });

        it('should get players list', () => {
            mockGameSubscriptionService.players = new Set(['player1', 'player2']);
            expect(gameService.playersList).toEqual(new Set(['player1', 'player2']));
        });

        it('should set and get the correct sort option', () => {
            expect(gameService.sortOption).toBe(SortOption.UsernameAscending);
            gameService.sortOption = SortOption.ScoreAscending;
            expect(mockGameSubscriptionService.sortOption).toBe(SortOption.ScoreAscending);
            expect(mockGameSubscriptionService.sortUsers).toHaveBeenCalled();
        });
    });

    describe('setChat', () => {
        it('should set chat for a user', () => {
            gameService.setChat('user', true);
            expect(mockWebSocketService.setChat).toHaveBeenCalled();
        });
    });

    describe('init', () => {
        it('should initialize if sessionStorageService response is ok', async () => {
            const payload: GameStatePayload = { state: GameState.NotStarted, payload: '' };
            mockSessionStorageService.initUser.and.returnValue(Promise.resolve({ ok: true, value: payload } as Result<GameStatePayload>));
            await gameService.init();
            expect(mockGameSubscriptionService.initSubscriptions).toHaveBeenCalled();
        });

        it('should not initialize if sessionStorageService response is not ok', async () => {
            mockSessionStorageService.initUser.and.returnValue(Promise.resolve({ ok: false } as Result<GameStatePayload>));
            await gameService.init();
            expect(mockGameSubscriptionService.initSubscriptions).not.toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('should reset the game subscription service', () => {
            gameService.reset();
            expect(mockGameSubscriptionService.reset).toHaveBeenCalled();
        });
    });

    describe('onKickPlayer', () => {
        it('should kick a player', () => {
            mockGameSubscriptionService.players = new Set(['player']);
            spyOn(mockGameSubscriptionService.players, 'delete');
            gameService.onKickPlayer('player');
            expect(mockGameSubscriptionService.players.delete).toHaveBeenCalled();
            expect(mockWebSocketService.banUser).toHaveBeenCalled();
        });
    });

    describe('leaveRoom', () => {
        it('should leave room if state is not Starting', () => {
            mockGameSubscriptionService.state = GameState.AskingQuestion;
            gameService.leaveRoom();
            expect(mockWebSocketService.leaveRoom).toHaveBeenCalled();
            expect(mockSessionStorageService.removeUser).toHaveBeenCalled();
            expect(mockGameSubscriptionService.reset).toHaveBeenCalled();
        });

        it('should not leave room if state is Starting', () => {
            mockGameSubscriptionService.state = GameState.Starting;
            gameService.leaveRoom();
            expect(mockWebSocketService.leaveRoom).not.toHaveBeenCalled();
        });
    });

    describe('isChoiceSelected', () => {
        it('should return true if choice is selected', () => {
            mockGameSubscriptionService.choicesSelected = [true, false, false, false];
            expect(gameService.isChoiceSelected(0)).toBeTrue();
        });

        it('should return false if choice is not selected', () => {
            mockGameSubscriptionService.choicesSelected = [true, false, false, false];
            expect(gameService.isChoiceSelected(1)).toBeFalse();
        });
    });

    describe('isChoiceCorrect', () => {
        it('should return true if choice is correct', () => {
            mockGameSubscriptionService.state = GameState.ShowResults;
            mockGameSubscriptionService.question = {
                choices: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            } as Question;
            expect(gameService.isChoiceCorrect(0)).toBeTrue();
        });

        it('should return false if choice is not correct', () => {
            mockGameSubscriptionService.state = GameState.LastQuestion;
            mockGameSubscriptionService.question = {
                choices: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            } as Question;
            expect(gameService.isChoiceCorrect(1)).toBeFalse();
        });

        it('should return false if state is not ShowResults or LastQuestion', () => {
            mockGameSubscriptionService.state = GameState.AskingQuestion;
            mockGameSubscriptionService.question = {
                choices: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            } as Question;
            expect(gameService.isChoiceCorrect(0)).toBeFalse();
        });

        it('should return false if question is undefined', () => {
            mockGameSubscriptionService.state = GameState.ShowResults;
            mockGameSubscriptionService.question = undefined;
            expect(gameService.isChoiceCorrect(0)).toBeFalse();
        });
    });

    describe('isChoiceIncorrect', () => {
        it('should return true if choice is incorrect', () => {
            mockGameSubscriptionService.state = GameState.ShowResults;
            mockGameSubscriptionService.question = {
                choices: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            } as Question;
            expect(gameService.isChoiceIncorrect(1)).toBeTrue();
        });

        it('should return false if choice is correct', () => {
            mockGameSubscriptionService.state = GameState.LastQuestion;
            mockGameSubscriptionService.question = {
                choices: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            } as Question;
            expect(gameService.isChoiceIncorrect(0)).toBeFalse();
        });

        it('should return false if state is not ShowResults or LastQuestion', () => {
            mockGameSubscriptionService.state = GameState.AskingQuestion;
            mockGameSubscriptionService.question = {
                choices: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            } as Question;
            expect(gameService.isChoiceIncorrect(0)).toBeFalse();
        });

        it('should return false if question is undefined', () => {
            mockGameSubscriptionService.state = GameState.ShowResults;
            mockGameSubscriptionService.question = undefined;
            expect(gameService.isChoiceIncorrect(0)).toBeFalse();
        });
    });

    describe('selectChoice', () => {
        it('should select a choice if in the AskingQuestion state and validation is not disabled', () => {
            mockGameSubscriptionService.state = GameState.AskingQuestion;
            mockGameSubscriptionService.isValidate = false;
            gameService.selectChoice(0);
            expect(mockWebSocketService.sendChoice).toHaveBeenCalled();
        });

        it('should not select a choice if validation is disabled', () => {
            mockGameSubscriptionService.state = GameState.AskingQuestion;
            mockGameSubscriptionService.isValidate = true;
            gameService.selectChoice(0);
            expect(mockWebSocketService.sendChoice).not.toHaveBeenCalled();
        });
    });

    describe('confirmQuestion', () => {
        it('should confirm a question if in the AskingQuestion state', () => {
            mockGameSubscriptionService.state = GameState.AskingQuestion;
            gameService.confirmQuestion();
            expect(mockWebSocketService.validateChoice).toHaveBeenCalled();
        });

        it('should not confirm a question if not in the AskingQuestion state', () => {
            mockGameSubscriptionService.state = GameState.ShowResults;
            gameService.confirmQuestion();
            expect(mockWebSocketService.validateChoice).not.toHaveBeenCalled();
        });
    });

    describe('nextQuestion', () => {
        it('should confirm the next question', () => {
            gameService.nextQuestion();
            expect(mockWebSocketService.hostConfirm).toHaveBeenCalled();
        });
    });

    describe('showFinalResults', () => {
        it('should show the final results', () => {
            gameService.showFinalResults();
            expect(mockWebSocketService.showFinalResults).toHaveBeenCalled();
        });
    });

    describe('Subscription Handlers', () => {
        it('should subscribe to timer updates', () => {
            const mockTime = 10;
            mockWebSocketService.getTime.and.returnValue(of(mockTime));
            gameService.timerSubscribe().subscribe((time) => {
                expect(time).toBe(mockTime);
            });
            expect(mockWebSocketService.getTime).toHaveBeenCalled();
        });

        it('should subscribe to game state updates', () => {
            const gameStatePayload: GameStatePayload = { state: GameState.AskingQuestion };
            const observable = of(gameStatePayload);
            mockWebSocketService.getState.and.returnValue(observable);
            gameService.stateSubscribe().subscribe((state) => {
                expect(state).toEqual(gameStatePayload);
            });
            expect(mockWebSocketService.getState).toHaveBeenCalled();
        });
    });

    describe('startGame', () => {
        it('should start a game successfully', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: true, value: GAME_PLACEHOLDER }));
            mockWebSocketService.createRoom.and.returnValue(Promise.resolve(USER));
            const result = await gameService.startGame(GAME_PLACEHOLDER);
            expect(result).toBeTrue();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/loading']);
        });

        it('should handle game fetch failure', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: false } as Result<Game>));
            const result = await gameService.startGame(GAME_PLACEHOLDER);
            expect(result).toBeFalse();
            expect(mockSnackBar.open).toHaveBeenCalled();
        });

        it('should handle game failure', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: true, value: GAME_PLACEHOLDER }));
            mockWebSocketService.createRoom.and.returnValue(Promise.reject());
            const result = await gameService.startGame(GAME_PLACEHOLDER);
            expect(result).toBeFalse();
            expect(mockSnackBar.open).toHaveBeenCalled();
        });

        it('should handle game failure', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: true, value: GAME_PLACEHOLDER }));
            mockWebSocketService.createRoom.and.returnValue(Promise.resolve(undefined as unknown as User));
            const result = await gameService.startGame(GAME_PLACEHOLDER);
            expect(result).toBeFalse();
            expect(mockSnackBar.open).toHaveBeenCalled();
        });
    });

    describe('startRandomGame', () => {
        it('should start a random game successfully', async () => {
            mockWebSocketService.startRandom.and.returnValue(Promise.resolve(USER));
            const result = await gameService.startRandomGame();
            expect(result).toBeTrue();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/loading']);
        });

        it('should handle game fetch failure', async () => {
            mockWebSocketService.startRandom.and.returnValue(Promise.resolve(undefined as unknown as User));
            const result = await gameService.startRandomGame();
            expect(result).toBeFalse();
            expect(mockSnackBar.open).toHaveBeenCalled();
        });
    });

    describe('testGame', () => {
        it('should test a game successfully', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: true, value: GAME_PLACEHOLDER }));
            mockWebSocketService.testGame.and.returnValue(Promise.resolve(USER));
            const result = await gameService.testGame(GAME_PLACEHOLDER);
            expect(result).toBeTrue();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/game']);
        });

        it('should handle game fetch failure', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: false } as Result<Game>));
            const result = await gameService.testGame(GAME_PLACEHOLDER);
            expect(result).toBeFalse();
            expect(mockSnackBar.open).toHaveBeenCalled();
        });

        it('should handle game test failure', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: true, value: GAME_PLACEHOLDER }));
            mockWebSocketService.testGame.and.returnValue(Promise.reject());
            const result = await gameService.testGame(GAME_PLACEHOLDER);
            expect(result).toBeFalse();
            expect(mockSnackBar.open).toHaveBeenCalled();
        });

        it('should handle game test failure', async () => {
            mockCommunicationService.getGameByID.and.returnValue(of({ ok: true, value: GAME_PLACEHOLDER }));
            mockWebSocketService.testGame.and.returnValue(Promise.resolve(undefined as unknown as User));
            const result = await gameService.testGame(GAME_PLACEHOLDER);
            expect(result).toBeFalse();
            expect(mockSnackBar.open).toHaveBeenCalled();
        });
    });

    describe('isResponseGood', () => {
        beforeEach(() => {
            mockGameSubscriptionService.question = {
                text: 'Question text',
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: false },
                    { text: 'Choice 3', isCorrect: false },
                    { text: 'Choice 4', isCorrect: false },
                ],
            } as Question;
        });

        it('should return false if response is undefined', () => {
            mockGameSubscriptionService.question = undefined;
            expect(gameService['isResponseGood']()).toBeFalse();
        });

        it('should return false if response is not good', () => {
            mockGameSubscriptionService.choicesSelected = [false, false, false, false];
            expect(gameService['isResponseGood']()).toBeFalse();
        });

        it('should return true if response is good', () => {
            mockGameSubscriptionService.choicesSelected = [true, false, false, false];
            expect(gameService['isResponseGood']()).toBeTrue();
        });
    });
});
