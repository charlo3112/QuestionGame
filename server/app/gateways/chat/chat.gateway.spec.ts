import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { RoomManagementService } from '@app/services/room-management.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: RoomManagementService,
                    useValue: createStubInstance(RoomManagementService),
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
        const payload = { roomId: 'X', message: 'X', name: 'X' };
        stub(socket, 'rooms').value(new Set(['X']));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('message:receive');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleMessage(socket, payload);
        expect(server.to.calledWith('X')).toBeTruthy();
        expect(logger.debug.calledOnce).toBeTruthy();
        expect(gateway['roomMessages'].get('X')?.length).toBe(1);
    });

    it('handleGetMessages() should send messages to the client', () => {
        stub(socket, 'rooms').value(new Set(['X']));
        gateway.handleGetMessages(socket, 'X');
        const roomMessages = gateway['roomMessages'].get('X') || [];
        expect(socket.emit.calledWith('messages:list', roomMessages)).toBeTruthy();
    });

    it('handleConnection() should log the connection', () => {
        gateway.handleConnection(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('handleDisconnect() should log the disconnection', () => {
        Object.defineProperty(server, 'sockets', { value: { adapter: { rooms: new Set() } } });
        gateway['roomMessages'].set('X', []);
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });
});
