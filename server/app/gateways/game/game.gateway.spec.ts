import { GameGateway } from '@app/gateways/game/game.gateway';
import { GameData } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Result } from '@common/interfaces/result';
import { User } from '@common/interfaces/user';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let roomManagementService: SinonStubbedInstance<RoomManagementService>;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        roomManagementService = createStubInstance(RoomManagementService);
        gameService = createStubInstance(GameService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: RoomManagementService,
                    useValue: roomManagementService,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('handleCreateGame() should create a game and join a room', async () => {
        const mockGameId = 'game123';
        const mockUser = { userId: 'user1', name: 'John Doe', roomId: 'room123' } as User;

        gameService.getGameById.returns(Promise.resolve({} as GameData));

        roomManagementService.createGame.returns(mockUser);

        const result = await gateway.handleCreateGame(socket, mockGameId);

        expect(result).toBeDefined();
        expect(result).toEqual(mockUser);
        expect(socket.join.calledWith(mockUser.roomId)).toBeTruthy();
        expect(logger.log.called).toBeTruthy();
    });

    it('handleCreateGame() should return null if game does not exist', async () => {
        const mockGameId = 'game123';

        gameService.getGameById.returns(Promise.resolve(null));

        const result = await gateway.handleCreateGame(socket, mockGameId);

        expect(result).toBeNull();
    });

    it('handleJoinGame() should let a user join a game', async () => {
        const mockPayload = { gameCode: 'game123', username: 'JaneDoe' };
        const mockResult: Result<GameStatePayload> = { ok: true, value: { state: GameState.Wait, payload: undefined } };

        roomManagementService.joinRoom.returns(mockResult);

        const result = await gateway.handleJoinGame(socket, mockPayload);

        expect(result).toEqual(mockResult);
        expect(socket.join.calledWith(mockPayload.gameCode)).toBeTruthy();
    });

    it('launchGame() should launch the game', () => {
        const roomId = 'room123';

        roomManagementService.getRoomId.returns(roomId);

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('game:state');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.launchGame(socket);

        expect(server.to.calledWith(roomId)).toBeTruthy();
    });

    it('handleDisconnect() should remove a user on disconnect', () => {
        gateway.handleDisconnect(socket);

        expect(roomManagementService.leaveUser.calledWith(socket.id)).toBeTruthy();
    });

    it('handleLeaveGame() should remove a user from the game', () => {
        gateway.handleLeaveGame(socket);

        expect(roomManagementService.performUserRemoval.calledWith(socket.id)).toBeTruthy();
    });

    it('handleToggleGame() should toggle the game closed', () => {
        const closed = true;

        gateway.handleToggleGame(socket, closed);

        expect(roomManagementService.toggleGameClosed.calledWith(socket.id, closed)).toBeTruthy();
    });

    it('handleRejoinGame() should let a user rejoin a game', async () => {
        const mockUser = { userId: 'user1', name: 'John Doe', roomId: 'room123' } as User;
        const mockResult: Result<GameStatePayload> = { ok: true, value: { state: GameState.Wait, payload: undefined } };

        roomManagementService.rejoinRoom.returns(mockResult);

        const result = await gateway.handleRejoinGame(socket, mockUser);

        expect(result).toEqual(mockResult);
        expect(socket.join.calledWith(mockUser.roomId)).toBeTruthy();
    });

    it('handleRejoinGame() should return an error if user cannot rejoin', async () => {
        const mockUser = { userId: 'user1', name: 'John Doe', roomId: 'room123' } as User;
        const mockResult: Result<GameState> = { ok: false, error: 'Reconnection impossible' };

        roomManagementService.rejoinRoom.returns(mockResult);

        const result = await gateway.handleRejoinGame(socket, mockUser);

        expect(result).toEqual(mockResult);
        expect(socket.join.called).toBeFalsy();
    });

    it('banUser() should ban a user from the game', () => {
        const username = 'JaneDoe';

        gateway.banUser(socket, username);

        expect(roomManagementService.banUser.calledWith(socket.id, username)).toBeTruthy();
    });

    it('getUsers() should return the users in the game', () => {
        const mockUsers = ['JohnDoe', 'JaneDoe'];

        roomManagementService.getUsers.returns(mockUsers);

        const result = gateway.getUsers(socket);

        expect(result).toEqual(mockUsers);
    });
});