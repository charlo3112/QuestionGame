import { ActiveGame } from '@app/model/classes/active-game/active-game';
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
import { Server, Socket } from 'socket.io';
import { GameGatewayReceive } from './game-receive.gateway';

describe('GameGatewayReceive', () => {
    let gateway: GameGatewayReceive;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let activeGame: SinonStubbedInstance<ActiveGame>;
    let roomManagementService: SinonStubbedInstance<RoomManagementService>;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        roomManagementService = createStubInstance(RoomManagementService);
        server = createStubInstance<Server>(Server);
        gameService = createStubInstance(GameService);
        activeGame = createStubInstance(ActiveGame);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGatewayReceive,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: RoomManagementService,
                    useValue: roomManagementService,
                },
                {
                    provide: ActiveGame,
                    useValue: activeGame,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        gateway = module.get<GameGatewayReceive>(GameGatewayReceive);
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
        gameService.getGameById.returns(Promise.resolve({ visibility: true } as GameData));
        roomManagementService.createGame.returns(
            new Promise((resolve) => {
                resolve(mockUser);
            }),
        );
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
        const mockResult: Result<GameStatePayload> = { ok: true, value: { state: GameState.WAIT, payload: undefined } };
        roomManagementService.joinRoom.returns(mockResult);
        const result = await gateway.handleJoinGame(socket, mockPayload);
        expect(result).toEqual(mockResult);
        expect(socket.join.calledWith(mockPayload.gameCode)).toBeTruthy();
    });

    it('launchGame() should launch the game', () => {
        gateway.launchGame(socket);
        expect(roomManagementService.confirmAction.calledOnceWithExactly(socket.id)).toBeTruthy();
    });

    it('handleChoice() should update selected choices', () => {
        const mockChoiceAnswers: boolean[] = [false, true, true, false];
        gateway.handleChoice(socket, mockChoiceAnswers);
        expect(roomManagementService.handleChoice.calledOnceWithExactly(socket.id, mockChoiceAnswers)).toBeTruthy();
    });

    it('handleDisconnect() should remove a user on disconnect', () => {
        gateway.handleDisconnect(socket);
        expect(roomManagementService.leaveUser.calledWith(socket.id)).toBeTruthy();
    });

    it('handleValidate() should send validation request', () => {
        gateway.handleValidate(socket);
        expect(roomManagementService.validateChoice.calledWith(socket.id)).toBeTruthy();
    });

    it('handleScore() should send request for the score', () => {
        gateway.handleScore(socket);
        expect(roomManagementService.getScore.calledWith(socket.id)).toBeTruthy();
    });

    it('isValidate() should send request for the validation', () => {
        gateway.isValidate(socket);
        expect(roomManagementService.isValidate.calledWith(socket.id)).toBeTruthy();
    });

    it('getChoice() should send request to get choices', () => {
        gateway.getChoice(socket);
        expect(roomManagementService.getChoice.calledWith(socket.id)).toBeTruthy();
    });

    it('showResults() should send request to go to showResult state', () => {
        gateway.showResults(socket);
        expect(roomManagementService.showFinalResults.calledWith(socket.id)).toBeTruthy();
    });

    it('handleLeaveGame() should remove a user from the game', () => {
        gateway.handleLeaveGame(socket);
        expect(roomManagementService.performUserRemoval.calledWith(socket.id)).toBeTruthy();
    });

    it('handleTestGame() allow the user to test a quiz', async () => {
        const mockGameId = 'game123';
        const mockUser = { userId: 'user1', name: 'John Doe', roomId: 'room123' } as User;
        gameService.getGameById.resolves({ visibility: true } as GameData);
        roomManagementService.testGame.resolves(mockUser);
        const mockActiveGame = { testGame: jest.fn() };
        roomManagementService.getActiveGame.returns(mockActiveGame as unknown as ActiveGame);
        socket.join.resolves();
        const result = await gateway.handleTestGame(socket, mockGameId);
        expect(result).toBeDefined();
        expect(result).toEqual(mockUser);
    });

    it('handleTestGame() should return null if game does not exist', async () => {
        const mockGameId = 'game123';
        gameService.getGameById.resolves(null);
        const result = await gateway.handleTestGame(socket, mockGameId);
        expect(result).toBeNull();
    });

    it('handleToggleGame() should toggle the game closed', () => {
        const closed = true;
        gateway.handleToggleGame(socket, closed);
        expect(roomManagementService.toggleGameClosed.calledWith(socket.id, closed)).toBeTruthy();
    });

    it('handleRejoinGame() should let a user rejoin a game', async () => {
        const mockUser = { userId: 'user1', name: 'John Doe', roomId: 'room123' } as User;
        const mockResult: Result<GameStatePayload> = { ok: true, value: { state: GameState.WAIT, payload: undefined } };
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
