/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { ActiveGame } from '@app/model/classes/active-game/active-game';
import { GameData } from '@app/model/database/game';
import { QuestionData } from '@app/model/database/question';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { HistoryService } from '@app/services/history/history.service';
import { QuestionService } from '@app/services/question/question.service';
import { MAX_CHOICES_NUMBER } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { RoomManagementService } from './room-management.service';

describe('RoomManagementService', () => {
    let service: RoomManagementService;
    let mockGateway: SinonStubbedInstance<GameGatewaySend>;
    let mockHistoryService: HistoryService;
    let mockQuestionService: QuestionService;

    let mockSystemMessage = jest.fn();

    beforeEach(() => {
        mockGateway = createStubInstance<GameGatewaySend>(GameGatewaySend);
        mockHistoryService = {} as unknown as HistoryService;
        mockQuestionService = { getAllQCMQuestions: jest.fn() } as unknown as QuestionService;
        service = new RoomManagementService(mockGateway, mockHistoryService, mockQuestionService);

        mockSystemMessage = jest.fn();

        service.setGatewayCallback(jest.fn());
        service.setSystemMessageCallback(mockSystemMessage);
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
        service.performUserRemoval = jest.fn();
        await service.createGame('user2', game);
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

    describe('rejoinRoom', () => {
        it('should not allow a user to rejoin a non-existing room', () => {
            const rejoinResult = service.rejoinRoom({ userId: 'user1', name: 'Organisateur', roomId: 'non-existing-room', play: true }, 'user1');

            expect(rejoinResult.ok).toBeFalsy();
        });

        it('should allow a user to rejoin an existing room', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('user2', game);
            const time = 1000;
            service['disconnectionTimers'].set(
                'user2',
                setTimeout(() => service.performUserRemoval('user2'), time),
            );
            const rejoinResult = service.rejoinRoom({ userId: 'user2', name: 'Organisateur', roomId: hostUser.roomId, play: true }, 'user1');

            expect(rejoinResult.ok).toBeTruthy();
        });

        it('should not allow a user to rejoin an existing room', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('user2', game);
            const rejoinResult = service.rejoinRoom({ userId: 'user1', name: 'Organisateur', roomId: hostUser.roomId, play: true }, 'user1');

            expect(rejoinResult.ok).toBeFalsy();
        });
    });

    describe('getQrlAnswers', () => {
        it('should return undefined if the game does not exist', () => {
            expect(service.getQrlAnswers('user1')).toStrictEqual([]);
        });

        it('should return the qrl answers of the user', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('user1', game);
            service.joinRoom('user2', hostUser.roomId, 'Guest');
            const qrlAnswers = service.getQrlAnswers('user2');
            expect(qrlAnswers).toStrictEqual([{ user: 'Guest', text: '', grade: Grade.Ungraded }]);
        });
    });

    describe('startPanicking', () => {
        it('should panic if the game exists', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('user1', game);
            const gameRoom = service['gameState'].get(hostUser.roomId);
            gameRoom['state'] = GameState.ASKING_QUESTION_QRL;
            gameRoom['timer'].seconds = 60;
            service.joinRoom('user2', hostUser.roomId, 'Guest');
            service.startPanicking('user1');
            expect(gameRoom['timer']['panicMode']).toBeTruthy();
        });

        it('should not panic if is not host', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('user1', game);
            const gameRoom = service['gameState'].get(hostUser.roomId);
            service.joinRoom('user2', hostUser.roomId, 'Guest');
            service.startPanicking('user2');
            expect(gameRoom['timer']['panicMode']).toBeFalsy();
        });
    });

    describe('togglePause', () => {
        it('should pause the game if the user is the host', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('user1', game);
            const gameRoom = service['gameState'].get(hostUser.roomId);
            gameRoom['state'] = GameState.ASKING_QUESTION_QRL;
            gameRoom['timer'].seconds = 60;
            service.joinRoom('user2', hostUser.roomId, 'Guest');
            service.togglePause('user1');
            expect(gameRoom['timer']['pause']).toBeTruthy();
        });

        it('should not pause the game if the user is not the host', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('user1', game);
            const gameRoom = service['gameState'].get(hostUser.roomId);
            gameRoom['state'] = GameState.ASKING_QUESTION_QRL;
            gameRoom['timer'].seconds = 60;
            service.joinRoom('user2', hostUser.roomId, 'Guest');
            service.togglePause('user2');
            expect(gameRoom['timer']['pause']).toBeFalsy();
        });
    });

    it('confirmAction should not permit a non-host', async () => {
        const confirmResult = await service.confirmAction('user1');
        expect(confirmResult).toBe(undefined);
    });

    describe('testGame', () => {
        it('should create a test game', async () => {
            service.performUserRemoval = jest.fn();
            const game = getFakeGame();
            await service.testGame('user2', game);
            expect(service.getRoomId('user2')).toBeDefined();
            await service.testGame('user2', game);
            expect(service.performUserRemoval).toHaveBeenCalled();
        });
    });

    describe('createRandomGame', () => {
        it('should not create a random game if no more question', async () => {
            mockQuestionService.getAllQCMQuestions = jest.fn().mockReturnValue(getFakeQuestions());
            const res = await service.createRandomGame('user2');
            expect(res.ok).toBeFalsy();
        });

        it('should create a random game', async () => {
            service.performUserRemoval = jest.fn();
            const game = getFakeGame();
            await service.testGame('user2', game);
            const numberQuestions = 5;
            mockQuestionService.getAllQCMQuestions = jest.fn().mockReturnValue(getFakeQuestions(numberQuestions));
            const res = await service.createRandomGame('user2');
            expect(res.ok).toBeTruthy();
        });
    });

    describe('handleChoice', () => {
        it('shoud be undefined if the user is not in a game', async () => {
            const mockChoices: boolean[] = [false, false, true, false];
            expect(service.handleChoice('user2', mockChoices)).toBeUndefined();
        });

        it('should be undefined if the user is not in a game', async () => {
            const game = getFakeGame();
            await service.createGame('user2', game);
            const mockChoices: boolean[] = [false, false, true, false];
            expect(service.handleChoice('user2', mockChoices)).toBeUndefined();
        });
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

    describe('leaveUser', () => {
        jest.useFakeTimers();

        beforeEach(() => {
            jest.clearAllTimers();
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

        // it('should set a removal timer when leaving a user', () => {
        //     const game = getFakeGame();
        //     service.createGame('user2', game);

        //     service.performUserRemoval = jest.fn();
        //     service.leaveUser('user2');
        //     expect(service['disconnectionTimers'].has('user2')).toBe(true);

        //     jest.advanceTimersByTime(TIMEOUT_DURATION + 1);

        //     expect(service.performUserRemoval).toHaveBeenCalledWith('user2');
        // });

        afterEach(() => {
            jest.useRealTimers();
        });
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

    describe('handleAnswers', () => {
        it('should return undefined if there is no active game for the user', () => {
            jest.spyOn(service, 'getActiveGame').mockReturnValue(undefined);
            const result = service.handleAnswers('user1', [{ user: 'Answer', text: 'Answer', grade: Grade.One }]);
            expect(result).toBeUndefined();
        });

        it('should return undefined if the user is not in the game', async () => {
            const game = getFakeGame();
            await service.createGame('user1', game);
            const result = service.handleAnswers('user1', [{ user: 'Answer', text: 'Answer', grade: Grade.One }]);
            expect(result).toBeUndefined();
        });
    });

    describe('handleQrlAnswer', () => {
        it('should return undefined if no active game exists for the user', () => {
            jest.spyOn(service, 'getActiveGame').mockReturnValue(undefined);
            const result = service.handleQrlAnswer('user1', 'Some answer');
            expect(result).toBeUndefined();
        });

        it('should return undefined if the user is not in the game', async () => {
            const game = getFakeGame();
            await service.createGame('user1', game);
            const result = service.handleQrlAnswer('user1', 'Some answer');
            expect(result).toBeUndefined();
        });
    });

    describe('setChat', () => {
        it('should do nothing if there is no active game for the host', () => {
            jest.spyOn(service, 'getActiveGame').mockReturnValue(undefined);

            const spyAlert = jest.spyOn(mockGateway, 'sendAlert');
            service.setChat('hostId', 'username', true);
            expect(spyAlert).not.toHaveBeenCalled();
        });

        it('should send an alert to the host if there is an active game', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('hostId', game);
            service.joinRoom('userId', hostUser.roomId, 'username');

            const spyAlert = jest.spyOn(mockGateway, 'sendAlert');
            service.setChat('hostId', 'username', true);
            expect(spyAlert).toHaveBeenCalled();
        });
    });

    describe('canChat', () => {
        it('should return false if there is no active game for the host', () => {
            jest.spyOn(service, 'getActiveGame').mockReturnValue(undefined);

            const result = service.canChat('hostId');
            expect(result).toBeFalsy();
        });

        it('should return true if there is an active game', async () => {
            const game = getFakeGame();
            const hostUser = await service.createGame('hostId', game);
            service.joinRoom('userId', hostUser.roomId, 'username');

            const result = service.canChat('hostId');
            expect(result).toBeTruthy();
        });
    });

    describe('generateRoomId', () => {
        it('should generate a random room id', () => {
            const roomId = service['generateRoomId']();
            expect(roomId).toBeDefined();
            expect(roomId.length).toBeGreaterThan(0);
        });

        it('should generate a different room id each time', () => {
            const maxNumberOfIds = 9000;
            for (let i = 0; i < maxNumberOfIds; i++) {
                const activeGame = {} as ActiveGame;
                service['gameState'].set(service['generateRoomId'](), activeGame);
            }

            expect(service['gameState'].size).toBe(maxNumberOfIds);
        });
    });

    describe('shuffleAndSliceQuestions', () => {
        it('should shuffle and slice questions correctly', () => {
            const questions = [
                { mongoId: 1, text: 'Question 1' },
                { mongoId: 2, text: 'Question 2' },
                { mongoId: 3, text: 'Question 3' },
                { mongoId: 4, text: 'Question 4' },
                { mongoId: 5, text: 'Question 5' },
                { mongoId: 6, text: 'Question 6' },
                { mongoId: 7, text: 'Question 7' },
                { mongoId: 8, text: 'Question 8' },
                { mongoId: 9, text: 'Question 9' },
                { mongoId: 10, text: 'Question 10' },
            ] as unknown as QuestionData[];
            const numberOfQuestions = 5;
            const shuffledQuestions = service['shuffleAndSliceQuestions'](questions, numberOfQuestions);

            expect(shuffledQuestions.length).toBe(numberOfQuestions);

            let isShuffled = false;
            for (let i = 1; i < shuffledQuestions.length; i++) {
                if (shuffledQuestions[i].mongoId !== shuffledQuestions[i - 1].mongoId + 1) {
                    isShuffled = true;
                    break;
                }
            }
            expect(isShuffled).toBe(true);
        });
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
