import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { WebsocketMessage } from '@common/enums/websocket-message';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
    let mockServer: SinonStubbedInstance<Server>;
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let roomManagementService: SinonStubbedInstance<RoomManagementService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        mockServer = createStubInstance(Server) as unknown as SinonStubbedInstance<Server>;
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        roomManagementService = createStubInstance(RoomManagementService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: RoomManagementService,
                    useValue: roomManagementService,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('handleMessage() should send message to the room', () => {
        stub(socket, 'rooms').value(new Set(['X']));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WebsocketMessage.MESSAGE_RECEIVED);
            },
        } as BroadcastOperator<unknown, unknown>);
        roomManagementService.getRoomId.returns('X');
        roomManagementService.getUsername.returns('test');
        roomManagementService.canChat.returns(true);
        gateway.handleMessage(socket, 'X');
        expect(server.to.calledWith('X')).toBeTruthy();
        expect(gateway['roomMessages'].get('X')?.length).toBe(1);
    });

    it('handleGetMessages() should send messages to the client', async () => {
        stub(socket, 'rooms').value(new Set(['X']));
        const res = await gateway.handleGetMessages(socket);
        const roomMessages = gateway['roomMessages'].get('X') || [];
        expect(res).toEqual(roomMessages);
    });

    it('handleMessage() should not send message to the room if room is not found', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.handleMessage(socket, 'X');
        expect(server.to.notCalled).toBeTruthy();
    });

    it('handleDeleteRoom() should delete the room', () => {
        gateway['roomMessages'].set('X', []);
        gateway['handleDeleteRoom']('X');
        expect(gateway['roomMessages'].has('X')).toBeFalsy();
    });

    it('handleMessage() should not send message if user cannot chat', () => {
        stub(socket, 'rooms').value(new Set(['X']));
        roomManagementService.getRoomId.returns('X');
        roomManagementService.getUsername.returns('test');
        roomManagementService.canChat.returns(false);
        gateway.handleMessage(socket, 'X');
        expect(server.to.notCalled).toBeTruthy();
    });

    it('handleMessage() should not send message if username is not found', () => {
        stub(socket, 'rooms').value(new Set(['X']));
        roomManagementService.getRoomId.returns('X');
        roomManagementService.getUsername.returns(null);
        roomManagementService.canChat.returns(true);
        gateway.handleMessage(socket, 'X');
        expect(server.to.notCalled).toBeTruthy();
    });

    it('handleGetMessages() should return empty array if room is not found', async () => {
        stub(socket, 'rooms').value(new Set());
        const res = await gateway.handleGetMessages(socket);
        expect(res).toEqual([]);
    });

    it('should send a system message when some condition is met', () => {
        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            // we need the any type here because we are mocking the server object
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        gateway['server'] = mockServer;
        const roomId = 'testRoom';
        const message = 'System message test';
        roomManagementService.getRoomId.returns(roomId);
        gateway['sendSystemMessage'](roomId, message);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
    });
});
