/* eslint-disable no-unused-vars */
import { GameData } from '@app/model/database/game';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { MAX_CHOICES_NUMBER } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';
import { RoomManagementService } from './room-management.service';
import { HistoryService } from '@app/services/history/history.service';
import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';

describe('RoomManagementService', () => {
    let service: RoomManagementService;
    let mockGateway: GameGatewaySend;
    let mockHistoryService: HistoryService;

    beforeEach(() => {
        mockGateway = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() } as unknown as GameGatewaySend;
        mockHistoryService = {} as unknown as HistoryService;
        service = new RoomManagementService(mockGateway, mockHistoryService);

        service.setGatewayCallback(jest.fn());
    });

    it('should create a game room and return user details', async () => {
        const game: GameData = getFakeGame();
        const user = await service.createGame('user1', game);

        expect(user).toBeDefined();
        expect(user.userId).toBe('user1');
        expect(user.roomId).toBeDefined();
        expect(user.name).toBe('Organisateur');
    });

    it('should allow a user to join an existing room', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user2', game);
        const joinResult = service.joinRoom('user3', hostUser.roomId, 'Guest');

        expect(joinResult.ok).toBeTruthy();
    });

    it('should not allow multiple users with the same name', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'test');
        const joinResult = service.joinRoom('user3', hostUser.roomId, 'test');
        expect(joinResult.ok).toBeFalsy();
    });

    it('should not allow multiple users with the same id', async () => {
        const game = getFakeGame();
        const performUserRemovalSpy = jest.spyOn(service, 'performUserRemoval');
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'test2');
        service.joinRoom('user2', hostUser.roomId, 'test3');
        expect(performUserRemovalSpy).toHaveBeenCalled();
    });

    it('should not allow a user to join a non-existing room', () => {
        const joinResult = service.joinRoom('user3', 'non-existing-room', 'Guest');

        expect(joinResult.ok).toBeFalsy();
    });

    it('getScore() should return 0 if the user is not in a game', () => {
        const scoreResult = service.getScore('user3');
        expect(scoreResult.score).toBe(0);
    });

    it('getScore() should return the users score', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        const scoreResult = service.getScore('user2');
        expect(scoreResult.score).toBe(0);
    });

    it('getChoice() should return the users selected choices', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        const choiceResult = service.getChoice('user2');
        expect(choiceResult[0]).toBeFalsy();
    });

    it('getChoice() should always return false if the users is not in a game', () => {
        const choiceResult = service.getChoice('user2');
        expect(choiceResult[2]).toBeFalsy();
    });

    it('validateChoice() should return undefined if the game does not exists', () => {
        expect(service.validateChoice('user1')).toBeUndefined();
    });

    it('isValidate() should return false if the game does not exists', () => {
        expect(service.isValidate('user1')).toBeFalsy();
    });

    it('isValidate() should return true if the player validates his choice', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        service.validateChoice('user2');
        expect(service.isValidate('user2')).toBeTruthy();
    });

    it('should not allow a user to join a locked room', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user2', game);
        service.toggleGameClosed(hostUser.userId, true);
        const joinResult = service.joinRoom('user3', hostUser.roomId, 'Guest');

        expect(joinResult.ok).toBeFalsy();
    });

    it('should not allow a user to rejoin a non-existing room', () => {
        const rejoinResult = service.rejoinRoom({ userId: 'user1', name: 'Organisateur', roomId: 'non-existing-room', play: true }, 'user1');

        expect(rejoinResult.ok).toBeFalsy();
    });

    it('confirmAction should not permit a non-host', async () => {
        const confirmResult = await service.confirmAction('user1');
        expect(confirmResult).toBe(undefined);
    });

    it('should create a test game', async () => {
        const game = getFakeGame();
        service.testGame('user2', game);
        expect(service.getRoomId('user2')).toBeDefined();
    });

    it('shoud be undefined if the user is not in a game', async () => {
        const mockChoices: boolean[] = [false, false, true, false];
        expect(service.handleChoice('user2', mockChoices)).toBeUndefined();
    });

    it('should allow a user to rejoin an existing room', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user2', game);
        const rejoinResult = service.rejoinRoom({ userId: 'user2', name: 'Organisateur', roomId: hostUser.roomId, play: true }, 'user1');

        expect(rejoinResult.ok).toBeTruthy();
    });

    it('should not toggle the game closed if the user is not the host', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user2', game);
        service.toggleGameClosed('user3', true);
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isLocked).toBeFalsy();
    });

    it('should toggle the game closed if the user is the host', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user2', game);
        service.toggleGameClosed(hostUser.userId, true);
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isLocked).toBeTruthy();
    });

    it('should remove a user from the game and delete de the game if needed', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        service.showFinalResults('user1');
        service.performUserRemoval('user2');
        const gameRoom = service['roomMembers'].get('user2');
        expect(gameRoom).toBeUndefined();
        expect(service['gameState'].get(hostUser.roomId)).toBeUndefined();
    });

    it('should not remove a user from a game that doesnt exist', async () => {
        expect(service.performUserRemoval('user2')).toBeUndefined();
    });

    it('should delete game if host is kicked', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        service.performUserRemoval('user1');
        const gameRoom = service['roomMembers'].get('user1');
        expect(gameRoom).toBeUndefined();
        expect(service['gameState'].get(hostUser.roomId)).toBeUndefined();
    });

    it('should ban a user from the game', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        service.banUser(hostUser.userId, 'Guest');
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isBanned('Guest')).toBeTruthy();
    });

    it('should return undefined if the game does not exist or is called by a guest', async () => {
        expect(service.banUser('admin', 'Guest')).toBeUndefined();

        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        const banResult = service.banUser('user2', hostUser.userId);
        expect(banResult).toBeUndefined();
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isBanned(hostUser.userId)).toBeFalsy();
    });

    it('leaveUser() should not ban a user from the game', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user2', game);
        service.leaveUser('user2');
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isBanned('Guest')).toBeFalsy();
    });

    it('leaveUser() should have no effect if the user does not exist', async () => {
        expect(service.leaveUser('user2')).toBeUndefined();
    });

    it('should get the list of users in the game', () => {
        const game = getFakeGame();
        service.createGame('user2', game);
        const users = service.getUsers('user2');
        expect(users).toHaveLength(1);
        expect(users[0]).toBe('Organisateur');
    });

    it('should not allow a user to fetch the users of a game hes no playing', async () => {
        expect(service.getUsers('user1')).toStrictEqual([]);
    });

    it('getRoomId() should return the id of the room', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        const idFromUser1 = service.getRoomId('user1');
        service.joinRoom('user2', hostUser.roomId, 'Guest');
        expect(service.getRoomId('user2')).toBe(idFromUser1);
    });

    it('confirmAction() should allow if the user is admin', async () => {
        const game = getFakeGame();
        const hostUser = await service.createGame('user1', game);
        const getActiveGameSpy = jest.spyOn(service, 'getActiveGame');
        await service.confirmAction(hostUser.userId);
        expect(getActiveGameSpy).toHaveBeenCalled();
    });
});

const getFakeGame = (): GameData => {
    const game = new GameData(getFakeCreateGameDto());
    return game;
};

const getFakeCreateGameDto = (): CreateGameDto => {
    const gameData: CreateGameDto = {
        title: 'test title',
        description: 'test description',
        duration: 40,
        questions: getFakeQuestions(),
        visibility: true,
    } as CreateGameDto;
    return gameData;
};

const getFakeQuestions = (numChoices: number = MAX_CHOICES_NUMBER): CreateQuestionDto[] => {
    const questions: CreateQuestionDto[] = [];
    for (let i = 0; i < numChoices; i++) {
        const questionData: CreateQuestionDto = {
            type: QuestionType.QCM,
            text: getRandomString(),
            points: 40,
            choices: getFakeChoices(),
        };
        questions.push(questionData);
    }

    return questions;
};

const getFakeChoices = (numChoices: number = MAX_CHOICES_NUMBER): CreateChoiceDto[] => {
    const choices: CreateChoiceDto[] = [];
    for (let i = 0; i < numChoices; i++) {
        const text = getRandomString();
        const isCorrect = i === 0;
        choices.push({ text, isCorrect });
    }

    return choices;
};

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
