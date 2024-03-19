import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Message } from '@common/interfaces/message';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { User } from '@common/interfaces/user';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Socket } from 'socket.io-client';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
    let service: WebSocketService;
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        mockSocket = jasmine.createSpyObj('Socket', ['emit', 'on']);
        TestBed.configureTestingModule({
            providers: [],
        });
        service = TestBed.inject(WebSocketService);

        service['createSocket'] = () => mockSocket;
        service['connect']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('sendMessage should emit the correct payload', () => {
        const testMessage = 'Hello, world!';
        service.sendMessage(testMessage);
        expect(mockSocket.emit).toHaveBeenCalledWith('message:send', testMessage);
    });

    it('joinRoom should emit the correct payload', () => {
        const payloadJoin: PayloadJoinGame = { gameCode: 'game123', username: 'John Doe' };
        service.joinRoom(payloadJoin.gameCode, payloadJoin.username);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:join', payloadJoin, jasmine.any(Function));
    });

    it('getMessage should return an observable and subscribe message', () => {
        const testMessage = 'Hello, world!';
        const testName = 'John Doe';
        const testRoomId = 'room123';

        let messageReceived = '';
        service.getMessage().subscribe((message) => {
            messageReceived = message.message;
        });

        mockSocket.on.calls.argsFor(0)[1]({ message: testMessage, name: testName, roomId: testRoomId });
        expect(messageReceived).toEqual(testMessage);
    });

    it('getMessages should emit the correct payload', () => {
        service.getMessages();
        expect(mockSocket.emit).toHaveBeenCalledWith('messages:get', jasmine.any(Function));
    });

    it('Should return the id of the socket', () => {
        const testId = 'socket123';
        mockSocket.id = testId;
        expect(service.id).toEqual(testId);
    });

    it('createRoom should emit the correct payload', () => {
        const testGameId = 'game123';
        service.createRoom(testGameId);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:create', testGameId, jasmine.any(Function));
    });

    it('rejoinRoom should emit the correct payload', () => {
        const testUser: User = { name: 'John Doe', roomId: 'room123', userId: 'user123' };
        service.rejoinRoom(testUser);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:rejoin', testUser, jasmine.any(Function));
    });

    it('toggleClosed should emit the correct payload', () => {
        const testClosed = true;
        service.toggleClosed(testClosed);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:toggle', testClosed);
    });

    it('launchGame should emit the correct payload', () => {
        service.hostConfirm();
        expect(mockSocket.emit).toHaveBeenCalledWith('game:launch');
    });

    it('leaveRoom should emit the correct payload', () => {
        service.leaveRoom();
        expect(mockSocket.emit).toHaveBeenCalledWith('game:leave');
    });

    it('banUser should emit the correct payload', () => {
        const testUserId = 'user123';
        service.banUser(testUserId);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:ban', testUserId);
    });

    it('getUsers should emit the correct payload', () => {
        service.getUsers();
        expect(mockSocket.emit).toHaveBeenCalledWith('game:users', jasmine.any(Function));
    });

    it('getClosedConnection should return an observable and subscribe message', () => {
        const testMessage = 'Hello, world!';

        let messageReceived = '';
        service.getClosedConnection().subscribe((message) => {
            messageReceived = message;
        });

        mockSocket.on.calls.argsFor(2)[1](testMessage);
        expect(messageReceived).toEqual(testMessage);
    });

    it('getState should return an observable and subscribe message', () => {
        mockSocket.on.and.callFake((eventName, callback) => {
            if (eventName === 'game:state') {
                const statePayload = { state: GameState.Wait };
                callback(statePayload);
            }
            return mockSocket;
        });

        service.getState().subscribe((state: GameStatePayload) => {
            expect(state.state).toEqual(GameState.Wait);
        });
    });

    it('getUserUpdate should return an observable and subscribe message', () => {
        const testUser: UserConnectionUpdate = { username: 'John Doe', isConnected: true };

        service.getUserUpdate().subscribe((user: UserConnectionUpdate) => {
            expect(user).toEqual(testUser);
        });

        mockSocket.on.calls.argsFor(3)[1](testUser);
    });

    it('should emit game:create event and resolve with the user', async () => {
        const testGameId = 'game123';
        const expectedUser: User = { name: 'John Doe', roomId: 'room123', userId: 'user123' };
        mockSocket.emit.and.callFake((eventName: string, gameId: string, callback: (user: User) => void) => {
            if (eventName === 'game:create' && gameId === testGameId) {
                callback(expectedUser);
            }
            return mockSocket;
        });
        const user = await service.createRoom(testGameId);
        expect(user).toEqual(expectedUser);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:create', testGameId, jasmine.any(Function));
    });

    it('should emit game:choice event with the correct choice array', () => {
        const testChoices = [true, false, true];
        service.sendChoice(testChoices);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:choice', testChoices);
    });

    it('should emit game:validate event', () => {
        service.validateChoice();
        expect(mockSocket.emit).toHaveBeenCalledWith('game:validate');
    });

    it('should emit game:isValidate event and resolve with a boolean value', fakeAsync(() => {
        const expectedValidation = true;
        mockSocket.emit.and.callFake((eventName: string, ...args: unknown[]) => {
            const callback = args.find((arg) => typeof arg === 'function');
            if (callback) {
                callback(expectedValidation);
            }
            return mockSocket;
        });

        service.isValidate().then((isValidate) => {
            expect(isValidate).toBe(expectedValidation);
        });

        tick();
    }));

    it('should emit game:getChoice event and resolve with a boolean array', async () => {
        const expectedChoices = [true, false, true];
        mockSocket.emit.and.callFake((eventName: string, callback: (choice: boolean[]) => void) => {
            if (eventName === 'game:getChoice') {
                callback(expectedChoices);
            }
            return mockSocket;
        });

        const result = await service.getChoice();
        expect(result).toEqual(expectedChoices);
    });

    it('should emit game:hostConfirm event when nextQuestion is called', () => {
        service.hostConfirm();
        expect(mockSocket.emit).toHaveBeenCalledWith('game:hostConfirm');
    });

    it('should emit game:results event when showResults is called', () => {
        service.showFinalResults();
        expect(mockSocket.emit).toHaveBeenCalledWith('game:results');
    });

    it('getMessages should resolve with an array of messages', fakeAsync(() => {
        const mockMessages: Message[] = [
            { name: 'test1', message: 'Hello', timestamp: 1 },
            { name: 'test2', message: 'Hi there', timestamp: 1 },
        ];
        mockSocket.emit.and.callFake((event: string, callback: Function) => {
            if (event === 'messages:get') {
                callback(mockMessages);
            }
            return mockSocket;
        });

        service.getMessages().then((messages) => {
            expect(messages).toEqual(mockMessages);
        });

        tick();
    }));

    it('getScore should resolve with a score object', fakeAsync(() => {
        const mockScore: Score = {
            score: 100,
            bonus: false,
        };
        mockSocket.emit.and.callFake((event: string, callback: Function) => {
            if (event === 'game:score') {
                callback(mockScore);
            }
            return mockSocket;
        });
        service.getScore().then((score) => {
            expect(score).toEqual(mockScore);
        });
        tick();
    }));

    it('joinRoom should resolve with the expected result', fakeAsync(() => {
        const gameCode = 'game123';
        const username = 'John Doe';
        const mockResult: Result<GameState> = {
            ok: true,
            value: GameState.Wait,
        };
        mockSocket.emit.and.callFake((event: string, payload: PayloadJoinGame, callback: Function) => {
            if (event === 'game:join' && payload.gameCode === gameCode && payload.username === username) {
                callback(mockResult);
            }
            return mockSocket;
        });
        service.joinRoom(gameCode, username).then((result) => {
            expect(result).toEqual(mockResult);
        });
        tick();
    }));

    it('rejoinRoom should resolve with the expected result', fakeAsync(() => {
        const mockUser: User = { name: 'John Doe', roomId: 'room123', userId: 'user123' };
        const mockGameStatePayload: GameStatePayload = {
            state: GameState.Wait,
            payload: 'room123',
        };
        const mockResult: Result<GameStatePayload> = {
            ok: true,
            value: mockGameStatePayload,
        };
        mockSocket.emit.and.callFake((event: string, user: User, callback: Function) => {
            if (event === 'game:rejoin' && user.userId === mockUser.userId) {
                callback(mockResult);
            }
            return mockSocket;
        });
        service.rejoinRoom(mockUser).then((result) => {
            expect(result).toEqual(mockResult);
        });
        tick();
    }));

    it('getUsers should resolve with an array of user IDs', fakeAsync(() => {
        const mockUsers: string[] = ['user1', 'user2', 'user3'];
        mockSocket.emit.and.callFake((event: string, callback: Function) => {
            if (event === 'game:users') {
                callback(mockUsers);
            }
            return mockSocket;
        });
        service.getUsers().then((users) => {
            expect(users).toEqual(mockUsers);
        });
        tick();
    }));

    it('should listen for score updates and update scoreSubject', () => {
        const mockScore: Score = { score: 100, bonus: true };
        service.getScoreUpdate().subscribe((score) => {
            expect(score).toEqual(mockScore);
        });
        mockSocket.on.calls.mostRecent().args[1](mockScore);
    });

    it('should listen for time updates and update timeSubject', () => {
        const mockTime = 120;
        service.getTime().subscribe((time) => {
            expect(time).toEqual(mockTime);
        });
        mockSocket.on.calls.mostRecent().args[1](mockTime);
    });
});
