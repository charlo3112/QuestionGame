import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';

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
        const testName = 'John Doe';
        const testRoomId = 'room123';
        service.sendMessage(testMessage, testName, testRoomId);

        expect(mockSocket.emit).toHaveBeenCalledWith('message:send', {
            roomId: testRoomId,
            message: testMessage,
            name: testName,
        });
    });

    it('joinRoom should emit the correct payload', () => {
        const testRoomId = 'room123';
        service.joinRoom(testRoomId);

        expect(mockSocket.emit).toHaveBeenCalledWith('join_room', testRoomId);
    });

    it('leaveRoom should emit the correct payload', () => {
        const testRoomId = 'room123';
        service.leaveRoom(testRoomId);

        expect(mockSocket.emit).toHaveBeenCalledWith('leave_room', testRoomId);
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

    it('getInitialMessages should return an observable and subscribe message', () => {
        const testMessage = 'Hello, world!';
        const testName = 'John Doe';
        const testRoomId = 'room123';

        let messagesReceived: string[] = [];
        service.getInitialMessages().subscribe((messages) => {
            messagesReceived = messages.map((message) => message.message);
        });

        mockSocket.on.calls.argsFor(1)[1]([{ message: testMessage, name: testName, roomId: testRoomId }]);

        expect(messagesReceived).toEqual([testMessage]);
    });

    it('getMessages should emit the correct payload', () => {
        const testRoomId = 'room123';
        service.getMessages(testRoomId);

        expect(mockSocket.emit).toHaveBeenCalledWith('messages:get', testRoomId);
    });
});
