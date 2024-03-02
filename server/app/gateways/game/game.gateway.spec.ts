import { GameGateway } from '@app/gateways/game/game.gateway';
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { GameState } from '@common/game-state';
import { Result } from '@common/result';
import { User } from '@common/user.interface';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
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

        gameService.getGameById.returns(Promise.resolve({} as Game));

        roomManagementService.createGame.returns(mockUser);

        stub(socket, 'id').value('user1');

        const result = await gateway.handleCreateGame(socket, mockGameId);

        expect(result).toBeDefined();
        expect(result).toEqual(mockUser);
        expect(socket.join.calledWith(mockUser.roomId)).toBeTruthy();
        expect(logger.log.called).toBeTruthy();
    });

    it('handleJoinGame() should let a user join a game', async () => {
        const mockPayload = { gameCode: 'game123', username: 'JaneDoe' };
        const mockResult: Result<GameState> = { ok: true, value: GameState.Wait };

        roomManagementService.joinRoom.returns(mockResult);

        const result = await gateway.handleJoinGame(socket, mockPayload);

        expect(result).toEqual(mockResult);
        expect(socket.join.calledWith(mockPayload.gameCode)).toBeTruthy();
    });

    it('launchGame() should launch the game', () => {
        const roomId = 'room123';
        const gameResult = GameState.Wait;

        roomManagementService.getRoomId.returns(roomId);
        roomManagementService.launchGame.returns(gameResult);

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('game:state');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.launchGame(socket);

        expect(server.to.calledWith(roomId)).toBeTruthy();
    });

    it('handleDisconnect() should remove a user on disconnect', () => {
        stub(socket, 'id').value('user1');

        gateway.handleDisconnect(socket);

        expect(roomManagementService.leaveUser.calledWith(socket.id)).toBeTruthy();
    });
});
