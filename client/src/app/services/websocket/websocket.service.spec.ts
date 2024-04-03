// We need every for great coverage so we disable the line limit
/* eslint-disable max-lines */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LISTEN_HISTOGRAM_DATA, LISTEN_SCORE_UPDATE, LISTEN_TIME_UPDATE, LISTEN_USERS_STAT } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { Message } from '@common/interfaces/message';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { User } from '@common/interfaces/user';
import { USERS, UserStat } from '@common/interfaces/user-stat';
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
        service['socket'] = mockSocket;
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
        const testUser: User = { name: 'John Doe', roomId: 'room123', userId: 'user123', play: true };
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
        expect(mockSocket.emit).toHaveBeenCalledWith('game:confirm');
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

    it('getState should return an observable and subscribe message', () => {
        const statePayload = { state: GameState.Wait };

        service.getState().subscribe((state) => {
            expect(state).toEqual(statePayload);
        });

        mockSocket.on.calls.argsFor(1)[1](statePayload);
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

    it('getUserUpdate should return an observable and subscribe message', () => {
        const testUser: UserConnectionUpdate = { username: 'John Doe', isConnected: true };

        service.getUserUpdate().subscribe((user: UserConnectionUpdate) => {
            expect(user).toEqual(testUser);
        });

        mockSocket.on.calls.argsFor(3)[1](testUser);
    });

    it('getTime should listen for time updates and update timeSubject', () => {
        const mockTime = 120;

        let timeReceived: number | undefined;
        service.getTime().subscribe((time) => {
            timeReceived = time;
        });

        mockSocket.on.calls.argsFor(LISTEN_TIME_UPDATE)[1](mockTime);
        expect(timeReceived).toEqual(mockTime);
    });

    it('getScoreUpdate should return an observable and subscribe message', () => {
        const mockScore: Score = { score: 100, bonus: true };

        let scoreReceived: Score | undefined;
        service.getScoreUpdate().subscribe((score) => {
            scoreReceived = score;
        });

        mockSocket.on.calls.argsFor(LISTEN_SCORE_UPDATE)[1](mockScore);
        expect(scoreReceived).toEqual(mockScore);
    });

    it('getUsersStat should return an observable and subscribe message', () => {
        const expectedUsersStat = USERS;

        let usersStatReceived: UserStat[] | undefined;
        service.getUsersStat().subscribe((usersStat) => {
            usersStatReceived = usersStat;
        });
        mockSocket.on.calls.argsFor(LISTEN_USERS_STAT)[1](expectedUsersStat);
        expect(usersStatReceived).toEqual(expectedUsersStat);
    });

    it('getHistogramData should return an observable and subscribe message', () => {
        const expectedHistogramData = HISTOGRAM_DATA;

        let histogramDataReceived: HistogramData | undefined;
        service.getHistogramData().subscribe((histogramData) => {
            histogramDataReceived = histogramData;
        });
        mockSocket.on.calls.argsFor(LISTEN_HISTOGRAM_DATA)[1](expectedHistogramData);
        expect(histogramDataReceived).toEqual(expectedHistogramData);
    });

    it('should emit game:create event and resolve with the user', async () => {
        const testGameId = 'game123';
        const expectedUser: User = { name: 'John Doe', roomId: 'room123', userId: 'user123', play: true };
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

    it('should emit game:confirm event when nextQuestion is called', () => {
        service.hostConfirm();
        expect(mockSocket.emit).toHaveBeenCalledWith('game:confirm');
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
        // We need to use Function to avoid using any as the type
        // eslint-disable-next-line @typescript-eslint/ban-types
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
        // We need to use Function to avoid using any as the type
        // eslint-disable-next-line @typescript-eslint/ban-types
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
        // We need to use Function to avoid using any as the type
        // eslint-disable-next-line @typescript-eslint/ban-types
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
        const mockUser: User = { name: 'John Doe', roomId: 'room123', userId: 'user123', play: true };
        const mockGameStatePayload: GameStatePayload = {
            state: GameState.Wait,
            payload: 'room123',
        };
        const mockResult: Result<GameStatePayload> = {
            ok: true,
            value: mockGameStatePayload,
        };
        // We need to use Function to avoid using any as the type
        // eslint-disable-next-line @typescript-eslint/ban-types
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
        // We need to use Function to avoid using any as the type
        // eslint-disable-next-line @typescript-eslint/ban-types
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

    it('isValidate should resolve with true', fakeAsync(() => {
        const expectedResult = true;
        mockSocket.emit.and.callFake((eventName: string, callback: (isValidate: boolean) => void) => {
            if (eventName === 'game:isValidate') {
                callback(expectedResult);
            }
            return mockSocket;
        });
        service.isValidate().then((result) => {
            expect(result).toEqual(expectedResult);
        });
        tick();
    }));

    it('should call testGame and resolve with a User object', async () => {
        const gameId = 'someGameId';
        const expectedUser: User = { name: 'Test User', roomId: 'someRoomId', userId: 'someUserId', play: true };
        mockSocket.emit.and.callFake((event, id, callback) => {
            if (event === 'game:test' && id === gameId) {
                callback(expectedUser);
            }
            return mockSocket;
        });
        const result = await service.testGame(gameId);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:test', gameId, jasmine.any(Function));
        expect(result).toEqual(expectedUser);
    });
});
