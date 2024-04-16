import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { UserData } from '@app/model/classes/user/user';
import { Users } from '@app/model/classes/users/users';
import { ChoiceData } from '@app/model/database/choice';
import { GameData } from '@app/model/database/game';
import { QuestionData } from '@app/model/database/question';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { HistoryService } from '@app/services/history/history.service';
import { MIN_TIME_PANIC_QCM_S, TIME_CONFIRM_S, WAITING_TIME_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ActiveGame } from './active-game';

describe('ActiveGame', () => {
    let mockGameData: GameData;
    let mockRoomId: string;
    let game: ActiveGame;
    let mockHostIsPlaying: boolean;
    let mockUpdateHistogram: jest.Mock;
    let users: Users;

    let mockGameGateway: SinonStubbedInstance<GameGatewaySend>;
    let mockHistoryService: SinonStubbedInstance<HistoryService>;

    beforeEach(() => {
        const choiceDtoOne = new CreateChoiceDto();
        choiceDtoOne.text = 'Paris';
        choiceDtoOne.isCorrect = true;
        const mockChoiceOne = new ChoiceData(choiceDtoOne);

        const choiceDtoTwo = new CreateChoiceDto();
        choiceDtoTwo.text = 'London';
        choiceDtoTwo.isCorrect = false;
        const mockChoiceTwo = new ChoiceData(choiceDtoTwo);

        const questionDto = new CreateQuestionDto();
        questionDto.type = QuestionType.QCM;
        questionDto.text = 'What is the capital of France?';
        questionDto.points = 40;
        questionDto.choices = [mockChoiceOne, mockChoiceTwo];
        const expectedQuestionData = new QuestionData(questionDto);

        const gameDto = new CreateGameDto();
        gameDto.title = 'New Game';
        gameDto.description = 'This is a new game';
        gameDto.duration = 60;
        gameDto.questions = [expectedQuestionData];
        gameDto.visibility = true;
        mockGameData = new GameData(gameDto);

        mockRoomId = 'roomId';

        mockGameGateway = createStubInstance(GameGatewaySend);
        mockHistoryService = createStubInstance(HistoryService);

        mockHostIsPlaying = false;

        game = new ActiveGame(mockGameData, mockRoomId, mockGameGateway, mockHistoryService, mockHostIsPlaying);
        users = new Users(mockGameGateway, mockHostIsPlaying, mockUpdateHistogram);
    });
    it('should be defined', () => {
        expect(ActiveGame).toBeDefined();
    });

    it('currentQuestionWithAnswers() should return the current question with answers', () => {
        const expectedQuestion = mockGameData.questions[0];

        const currentQuestionWithAnswers = game['game'].currentQuestionWithAnswer;
        expect(currentQuestionWithAnswers).toStrictEqual(expectedQuestion);
    });

    it('currentQuestionWithoutAnswers() should return the current question with answers', () => {
        const expectedQuestion = mockGameData.questions[0];
        const expectedQuestionWithoutCorrectAnswer = {
            type: expectedQuestion.type,
            text: expectedQuestion.text,
            points: expectedQuestion.points,
            choices: expectedQuestion.choices.map((choice: ChoiceData) => {
                return {
                    text: choice.text,
                    isCorrect: false,
                };
            }),
        };

        const currentQuestionWithoutAnswers = game['game'].currentQuestionWithoutAnswer;
        expect(currentQuestionWithoutAnswers).toStrictEqual(expectedQuestionWithoutCorrectAnswer);
    });

    it('gameStatePayload() should return game title as payload when state is Starting', () => {
        game['advanceState'](GameState.STARTING);
        const expectedPayload = { state: GameState.STARTING, payload: mockGameData.title };
        const receivedPayload = game.gameStatePayload;
        expect(receivedPayload).toStrictEqual(expectedPayload);
    });

    it('gameStatePayload() should return question with answers as payload when state is SHOW_RESULTS', () => {
        game['advanceState'](GameState.SHOW_RESULTS);
        const expectedPayload = { state: GameState.SHOW_RESULTS, payload: game['game'].currentQuestionWithAnswer };
        const receivedPayload = game.gameStatePayload;
        expect(receivedPayload).toStrictEqual(expectedPayload);
    });

    it('isLocked() should lock the game', () => {
        game.isLocked = true;
        expect(game.isLocked).toBe(true);
    });

    it('banUser() should return undefined when currentstate !== WAIT', () => {
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        const result = game.banUser('userId');
        expect(result).toBeUndefined();
    });

    it('getChoice() should return an array of false when there is no user', () => {
        const result = game.getChoice('userId');
        expect(result).toStrictEqual([false, false, false, false]);
    });

    it('getScore() should return 0 when there is no user', () => {
        const result = game.getScore('userId');
        expect(result).toStrictEqual({ bonus: false, score: 0 });
    });

    it('handleChoice() should return if no user', () => {
        const result = game.handleChoice('userId', [false, false, false, false]);
        expect(result).toBeUndefined();
    });

    it('handleChoice() should return if currentState === ASKING_QUESTION and user validate is not undefined', () => {
        const mockUserData = new UserData('userId', 'roomId', 'username');
        mockUserData.validate = 2;
        game.addUser(mockUserData);
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        const result = game.handleChoice('userId', [false, false, false, false]);
        expect(result).toBeUndefined();
    });

    it('handleChoice() should call sendUserSelectedChoice if currentState !== ASKING_QUESTION', () => {
        const mockUserData = new UserData('userId', 'roomId', 'username');
        game.addUser(mockUserData);
        const sendUserSelectedChoiceMock = jest.spyOn(game, 'sendUserSelectedChoice');
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        game.handleChoice('userId', [false, false, false, false]);
        expect(sendUserSelectedChoiceMock).toHaveBeenCalled();
    });

    it('isHost() should return false if no user', () => {
        const result = game.isHost('userId');
        expect(result).toBe(false);
    });

    it('isValidate() should return false if no user', () => {
        const result = game.isValidate('userId');
        expect(result).toBe(false);
    });

    it('sendUserSelectedChoice() should break if no user.userChoice', () => {
        const mockUserData = new UserData('userId', 'roomId', 'username');
        game.addUser(mockUserData);
        const result = game.sendUserSelectedChoice();
        expect(result).toBeUndefined();
    });

    it('needToClosed() should be true if the game is empty', async () => {
        expect(game.needToClosed()).toBeTruthy();
    });

    it('showFinalResults() should change game state', async () => {
        game.showFinalResults();
        expect(game.currentState).toBe(GameState.SHOW_FINAL_RESULTS);
    });

    it('userExist() should be false if the user is not in the game', async () => {
        const searchResult = game.userExists('user');
        expect(searchResult).toBeFalsy();
    });

    it('validateChoice() should be undefined if the user is not in the game', async () => {
        const validationResult = game.validateChoice('user');
        expect(validationResult).toBeUndefined();
    });

    it('advance() should not start the game if the room is unlocked', async () => {
        game.isLocked = false;
        jest.spyOn(game, 'launchGame');
        await game.advance();
        expect(game.launchGame).not.toHaveBeenCalled();
    });

    it('advanceState() should modify the state of the Game', () => {
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        expect(game.currentState).toBe(GameState.ASKING_QUESTION_QCM);
    });

    it('setChat() should return undefined if the user is not in the game', () => {
        const result = game.setChat('hostId', 'username', true);
        expect(result).toBeUndefined();
    });

    it('canChat() should return false if the user is not in the game', () => {
        const result = game.canChat('userId');
        expect(result).toBeFalsy();
    });

    it('startPanicking() should return undefined if the state is not AskingQuestion', () => {
        const result = game.startPanicking();
        expect(result).toBeUndefined();
    });

    it('togglePause() should return undefined if the state isnt AskingQuestion', () => {
        const result = game.togglePause();
        expect(result).toBeUndefined();
    });

    it('togglePause() should toggle the timer if the game state is AskingQuestion', () => {
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        game.togglePause();
        expect(game['timer']['timeData'].pause).toBeTruthy();
    });

    it('advance() should return undefined if game state is wait and game not locked', async () => {
        game['advanceState'](GameState.WAIT);
        game.isLocked = false;
        return game.advance().then((result) => {
            expect(result).toBeUndefined();
        });
    });

    it('advance() should launch the game if game state is wait and game locked', async () => {
        game['advanceState'](GameState.WAIT);
        game.isLocked = true;
        const launchGameMock = jest.spyOn(game, 'launchGame');
        return game.advance().then(() => {
            expect(launchGameMock).toHaveBeenCalled();
        });
    });

    it('advance() should start the timer ', async () => {
        jest.useFakeTimers();
        game['advanceState'](GameState.SHOW_RESULTS);
        game.isLocked = true;
        game['questionIndex'] = 0;
        game['game'].questions.length = 1;
        jest.advanceTimersByTime(TIME_CONFIRM_S);
        const startTimerMock = jest.spyOn(game['timer'], 'start');
        await game.advance();
        expect(startTimerMock).toHaveBeenCalled();
    });
    // it('advance() should show final results  ', async () => {
    //     jest.useFakeTimers();
    //     game['advanceState'](GameState.SHOW_RESULTS);
    //     game.isLocked = true;
    //     game['questionIndex'] = 2;
    //     game['game'].questions.length = 1;
    //     const advanceStateMock = jest.spyOn(game, 'advanceState');

    //     await game.advance();
    //     expect(advanceStateMock).toHaveBeenCalledWith(GameState.SHOW_FINAL_RESULTS);
    // });

    it('advance() should break if in different state than SHOW_RESULTS', async () => {
        game['advanceState'](GameState.WAITING_FOR_ANSWERS);
        const advanceMock = jest.spyOn(game, 'advance');
        await game.advance();
        expect(advanceMock).toReturn();
    });

    it('getQrlAnswers() should return an empty array if the user is not in the game', () => {
        const result = game.getQrlAnswers();
        expect(result).toStrictEqual([]);
    });

    it('handleAnswers() should return undefined if the user is not in the game', () => {
        const answer = [{ user: 'userId', text: 'answer', grade: Grade.One }] as QrlAnswer[];
        const result = game.handleAnswers('userId', answer);
        expect(result).toBeUndefined();
    });

    // it('handleAnswers() should call handleAnswers if the user is in the game', () => {
    //     const answer = [{ user: 'userId', text: 'answer', grade: Grade.One }] as QrlAnswer[];
    //     const handleAnswersMock = jest.spyOn(game['users'], 'handleAnswers');
    //     const user = new UserData('userId', 'roomId', 'username');
    //     game.addUser(user);
    //     // game['users'].user
    //     jest.spyOn(game['users'], 'isHost').mockReturnValue(true);
    //     console.log(game['users'].hostId);
    //     game['advanceState'](GameState.ASKING_QUESTION_QRL);
    //     game.handleAnswers('userId', answer);
    //     expect(handleAnswersMock).toHaveBeenCalled();
    // });

    it('handleQrlAnswer() should return undefined if the user is not in the game', () => {
        const result = game.handleQrlAnswer('userId', 'answer');
        expect(result).toBeUndefined();
    });

    it('handleQrlAnswer() should call handleAnswer if the user is in the game', () => {
        const handleAnswerMock = jest.spyOn(game['users'], 'handleAnswer');
        const user = new UserData('userId', 'roomId', 'username');
        game.addUser(user);
        game['advanceState'](GameState.ASKING_QUESTION_QRL);
        game.handleQrlAnswer('userId', 'answer');
        expect(handleAnswerMock).toHaveBeenCalled();
    });

    it('removeUser() should stop the timer if all users have validated their answers', () => {
        const stopTimerMock = jest.spyOn(game['timer'], 'stop');
        const user = new UserData('userId', 'roomId', 'username');
        game.addUser(user);
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        game.removeUser('userId');
        expect(stopTimerMock).toHaveBeenCalled();
    });

    it('startPanicking() should set the panicking flag to true', () => {
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        game['timer']['seconds'] = MIN_TIME_PANIC_QCM_S + 1;
        game.startPanicking();
        expect(game['timer']['panicMode']).toBeTruthy();
    });

    it('launchGame() should call the start method of the timer', () => {
        const startTimerMock = jest.spyOn(game['timer'], 'start');
        game.launchGame();
        expect(startTimerMock).toHaveBeenCalledWith(WAITING_TIME_S);
    });
});
