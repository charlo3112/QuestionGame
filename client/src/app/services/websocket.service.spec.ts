import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';

import { GameState } from '@common/game-state';
import { PayloadJoinGame } from '@common/payload-game.interface';
import { UserConnectionUpdate } from '@common/user-update.interface';
import { User } from '@common/user.interface';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
    let service: WebSocketService;
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        mockSocket = jasmine.createSpyObj('Socket', ['emit', 'on']);
        TestBed.configureTestingModule({});
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
        const testState = GameState.Wait;

        service.getState().subscribe((state: GameState) => {
            expect(state).toEqual(testState);
        });

        mockSocket.on.calls.argsFor(1)[1](testState);
    });

    it('getUserUpdate should return an observable and subscribe message', () => {
        const testUser: UserConnectionUpdate = { username: 'John Doe', isConnected: true };

        service.getUserUpdate().subscribe((user: UserConnectionUpdate) => {
            expect(user).toEqual(testUser);
        });

        mockSocket.on.calls.argsFor(3)[1](testUser);
    });
});
