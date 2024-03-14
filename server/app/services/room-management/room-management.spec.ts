/* eslint-disable no-unused-vars */
import { GameData } from '@app/model/database/game';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { MAX_CHOICES_NUMBER } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Score } from '@common/interfaces/score';
import { Logger } from '@nestjs/common';
import { RoomManagementService } from './room-management.service';

describe('RoomManagementService', () => {
    let service: RoomManagementService;
    let mockLogger: Logger;

    const updateStateMock = (roomId: string, gameState: GameStatePayload) => {
        return;
    };

    const updateScoreMock = (roomId: string, score: Score) => {
        return;
    };

    const updateTimeMock = (roomId: string, time: number) => {
        return;
    };

    beforeEach(() => {
        mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() } as unknown as Logger;
        service = new RoomManagementService(mockLogger);

        service.setDisconnectUser(jest.fn());
        service.setUpdateUser(jest.fn());
    });

    it('should create a game room and return user details', () => {
        const game: GameData = getFakeGame();
        const user = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);

        expect(user).toBeDefined();
        expect(user.userId).toBe('user1');
        expect(user.roomId).toBeDefined();
        expect(user.name).toBe('Organisateur');
    });

    it('should allow a user to join an existing room', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        const joinResult = service.joinRoom('user3', hostUser.roomId, 'Guest');

        expect(joinResult.ok).toBeTruthy();
    });

    it('should not allow a user to join a non-existing room', () => {
        const joinResult = service.joinRoom('user3', 'non-existing-room', 'Guest');

        expect(joinResult.ok).toBeFalsy();
    });

    it('should not allow a user to join a locked room', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        service.toggleGameClosed(hostUser.userId, true);
        const joinResult = service.joinRoom('user3', hostUser.roomId, 'Guest');

        expect(joinResult.ok).toBeFalsy();
    });

    it('should not allow a user to join a room that is already starting', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        service.toggleGameClosed(hostUser.userId, true);
        service.launchGame(hostUser.userId);
        const joinResult = service.joinRoom('user3', hostUser.roomId, 'Guest');

        expect(joinResult.ok).toBeFalsy();
    });

    it('should not allow a non-host user to launch the game', () => {
        const game = getFakeGame();
        service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        const launchResult = service.launchGame('user3');

        expect(launchResult).toBeUndefined();
    });

    it('should allow the host user to launch the game', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        service.toggleGameClosed(hostUser.userId, true);
        const launchResult = service.launchGame(hostUser.userId);

        expect(launchResult).toBe(GameState.Starting);
    });

    it('should not allow a user to rejoin a non-existing room', () => {
        const rejoinResult = service.rejoinRoom({ userId: 'user1', name: 'Organisateur', roomId: 'non-existing-room' }, 'user1');

        expect(rejoinResult.ok).toBeFalsy();
    });

    it('should allow a user to rejoin an existing room', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        const rejoinResult = service.rejoinRoom({ userId: 'user2', name: 'Organisateur', roomId: hostUser.roomId }, 'user1');

        expect(rejoinResult.ok).toBeTruthy();
    });

    it('should not toggle the game closed if the user is not the host', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        service.toggleGameClosed('user3', true);
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isLocked).toBeFalsy();
    });

    it('should toggle the game closed if the user is the host', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        service.toggleGameClosed(hostUser.userId, true);
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isLocked).toBeTruthy();
    });

    it('should remove a user from the game', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        service.performUserRemoval('user2');
        const gameRoom = service['roomMembers'].get('user2');
        expect(gameRoom).toBeUndefined();
        // it's the only user in the room, so the room should be deleted
        expect(service['gameState'].get(hostUser.roomId)).toBeUndefined();
    });

    it('should ban a user from the game', () => {
        const game = getFakeGame();
        const hostUser = service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        service.banUser('user2', 'Guest');
        const gameRoom = service['gameState'].get(hostUser.roomId);
        expect(gameRoom.isBanned('Guest')).toBeTruthy();
    });

    it('should get the list of users in the game', () => {
        const game = getFakeGame();
        service.createGame('user2', game, updateStateMock, updateTimeMock, updateScoreMock);
        const users = service.getUsers('user2');
        expect(users).toHaveLength(1);
        expect(users[0]).toBe('Organisateur');
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
