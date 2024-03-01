import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';

import { PayloadJoinGame } from '@common/payload-game.interface';
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

        expect(mockSocket.emit).toHaveBeenCalledWith('join_room', payloadJoin);
    });

    it('leaveRoom should emit the correct payload', () => {
        service.leaveRoom();

        expect(mockSocket.emit).toHaveBeenCalledWith('leave_room');
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

        expect(mockSocket.emit).toHaveBeenCalledWith('messages:get');
    });
});
