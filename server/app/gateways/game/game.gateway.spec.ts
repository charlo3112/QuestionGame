import { GameGateway } from '@app/gateways/game/game.gateway';
import { GameData } from '@app/model/database/game';
import { ActiveGame } from '@app/services/active-game/active-game';
import { GameService } from '@app/services/game/game.service';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { QUESTIONS_PLACEHOLDER } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { User } from '@common/interfaces/user';
import { USERS, UserStat } from '@common/interfaces/user-stat';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let activeGame: SinonStubbedInstance<ActiveGame>;
    let roomManagementService: SinonStubbedInstance<RoomManagementService>;
    let gameService: SinonStubbedInstance<GameService>;
    let mockServer;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        roomManagementService = createStubInstance(RoomManagementService);
        server = createStubInstance<Server>(Server);
        gameService = createStubInstance(GameService);
        activeGame = createStubInstance(ActiveGame);

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
                    provide: ActiveGame,
                    useValue: activeGame,
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

    beforeEach(() => {
        mockServer = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
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
        gameService.getGameById.resolves({} as GameData);
        roomManagementService.testGame.resolves(mockUser);
        const mockActiveGame = { testGame: jest.fn() };
        roomManagementService.getActiveGame.returns(mockActiveGame as unknown as ActiveGame);
        socket.join.resolves();
        const result = await gateway.handleTestGame(socket, mockGameId);
        expect(result).toBeDefined();
        expect(result).toEqual(mockUser);
        expect(mockActiveGame.testGame).toBeCalled();
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

    it('updateQuestionsCounter() should emit questions counter to the specified room', () => {
        const roomId = 'room123';
        const questionsCounter = [1, 2, 3];
        gateway.updateQuestionsCounter.call({ server: mockServer }, roomId, questionsCounter);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:questionsCounter', questionsCounter);
    });

    it('handleDeleteRoom() should close the room', () => {
        const roomId = 'room123';
        const mockServerSocketLeave = { to: jest.fn().mockReturnThis(), emit: jest.fn(), socketsLeave: jest.fn() };
        gateway['handleDeleteRoom'].call({ server: mockServerSocketLeave }, roomId);
        expect(mockServerSocketLeave.to).toHaveBeenCalledWith(roomId);
        expect(mockServerSocketLeave.emit).toHaveBeenCalledWith('game:closed', 'La partie a été fermée');
        expect(mockServerSocketLeave.socketsLeave).toHaveBeenCalledWith(roomId);
    });

    it('handleUserRemoval() should remove a user from the game', () => {
        const userId = 'user123';
        const message = 'User removed';
        gateway['handleUserRemoval'].call({ server: mockServer }, userId, message);
        expect(mockServer.to).toHaveBeenCalledWith(userId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:closed', message);
    });

    it('handleUpdateUser() should update a user in the game', () => {
        const roomId = 'room123';
        const userUpdate = { userId: 'user123', name: 'JohnDoe' };
        gateway['handleUpdateUser'].call({ server: mockServer }, roomId, userUpdate);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:user-update', userUpdate);
    });

    it('handleStateUpdate() should send new game state', () => {
        const roomId = 'room123';
        const state: GameStatePayload = { state: GameState.Wait, payload: undefined };
        gateway['handleStateUpdate'].call({ server: mockServer }, roomId, state);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:state', state);
    });

    it('handleTimeUpdate() should send new user stats', () => {
        const roomId = 'room123';
        const time = 10;
        gateway['handleTimeUpdate'].call({ server: mockServer }, roomId, time);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:time', time);
    });

    it('handleScoreUpdate() should send new user stats', () => {
        const roomId = 'room123';
        const score: Score = {
            score: 4,
            bonus: true,
        };
        gateway['handleScoreUpdate'].call({ server: mockServer }, roomId, score);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:score', score);
    });

    it('handleUsersStatUpdate() should send new user stats', () => {
        const roomId = 'room123';
        const userStat: UserStat[] = USERS;
        gateway['handleUsersStatUpdate'].call({ server: mockServer }, roomId, userStat);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:users-stat', userStat);
    });

    it('handleHistogramDataUpdate() should send new histogram data', () => {
        const roomId = 'room123';
        const histogramData: HistogramData = {
            choicesCounters: [
                [1, 2, 3],
                [2, 1, 3],
            ],
            question: QUESTIONS_PLACEHOLDER,
            indexCurrentQuestion: 4,
        };
        gateway['handleHistogramDataUpdate'].call({ server: mockServer }, roomId, histogramData);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('game:histogramData', histogramData);
    });
});
