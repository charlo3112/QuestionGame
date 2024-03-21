import { UserData } from '@app/model/classes/user/user';
import { ChoiceData } from '@app/model/database/choice';
import { GameData } from '@app/model/database/game';
import { QuestionData } from '@app/model/database/question';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { ActiveGame } from './active-game';

describe('ActiveGame', () => {
    let mockGameData: GameData;
    let game: ActiveGame;

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
    });
    it('should be defined', () => {
        expect(ActiveGame).toBeDefined();
    });

    it('currentQuestionWithAnswers() should return the current question with answers', () => {
        const expectedQuestion = mockGameData.questions[0];
        const expectedQuestionWithCorrectAnswer = { ...expectedQuestion };

        const currentQuestionWithAnswers = game.currentQuestionWithAnswer;
        expect(currentQuestionWithAnswers).toStrictEqual(expectedQuestionWithCorrectAnswer);
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

        const currentQuestionWithoutAnswers = game.currentQuestionWithoutAnswer;
        expect(currentQuestionWithoutAnswers).toStrictEqual(expectedQuestionWithoutCorrectAnswer);
    });

    it('gameData() should return the game data', () => {
        const gameData = game.gameData;
        expect(gameData).toBeDefined();
    });

    it('gameStatePayload() should return game title as payload when state is Starting', () => {
        game['advanceState'](GameState.Starting);
        const expectedPayload = { state: GameState.Starting, payload: mockGameData.title };
        const receivedPayload = game.gameStatePayload;
        expect(receivedPayload).toStrictEqual(expectedPayload);
    });

    it('gameStatePayload() should return question with answers as payload when state is ShowResults', () => {
        game['advanceState'](GameState.ShowResults);
        const expectedPayload = { state: GameState.ShowResults, payload: game.currentQuestionWithAnswer };
        const receivedPayload = game.gameStatePayload;
        expect(receivedPayload).toStrictEqual(expectedPayload);
    });

    it('isLocked() should lock the game', () => {
        game.isLocked = true;
        expect(game.isLocked).toBe(true);
    });

    it('addUser() should add a user', async () => {
        const mockUserData = new UserData('userId', 'roomId', 'username');
        game.addUser(mockUserData);
        expect(game.usersStat.length).toBe(1);
    });

    it('banUser() should return undefined when currentstate !== Wait', () => {
        game['advanceState'](GameState.AskingQuestion);
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

    it('handleChoice() should return if currentState === AskingQuestion and user validate is not undefined', () => {
        const mockUserData = new UserData('userId', 'roomId', 'username');
        mockUserData.validate = 2;
        game.addUser(mockUserData);
        game['advanceState'](GameState.AskingQuestion);
        const result = game.handleChoice('userId', [false, false, false, false]);
        expect(result).toBeUndefined();
    });

    it('handleChoice() should call sendUserSelectedChoice if currentState !== AskingQuestion', () => {
        const mockUserData = new UserData('userId', 'roomId', 'username');
        game.addUser(mockUserData);
        const sendUserSelectedChoiceMock = jest.spyOn(game, 'sendUserSelectedChoice');
        game['advanceState'](GameState.AskingQuestion);
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

    it('sendUserSelectedChoice() should add userChoice to histogram', () => {
        const mockUserData = new UserData('userId', 'roomId', 'username');
        mockUserData.newChoice = [false, true, false, false];
        game.addUser(mockUserData);
        game.sendUserSelectedChoice();
        const expectedCounter = [0, 1, 0, 0];
        expect(game.histoData.choicesCounters[game.questionIndexCurrent]).toStrictEqual(expectedCounter);
    });

    it('needToClosed() should be true if the game is empty', async () => {
        expect(game.needToClosed()).toBeTruthy();
    });

    it('showFinalResults() should change game state', async () => {
        game.showFinalResults();
        expect(game.currentState).toBe(GameState.ShowFinalResults);
    });

    it('userExist() should be false if the user is not in the game', async () => {
        const searchResult = game.userExists('user');
        expect(searchResult).toBeFalsy();
    });

    it('validateChoice() should be undefined if the user is not in the game', async () => {
        const validationResult = game.validateChoice('user');
        expect(validationResult).toBeUndefined();
    });

    it('advance() should not start the game if the room in unlocked', async () => {
        game.isLocked = false;
        expect(await game.advance()).toBeNull();
    });

    // it('advance() should start the game if the room in locked', async () => {
    //     game.isLocked = true;
    //     const launchGameMock = jest.spyOn(game, 'launchGame');
    //     await game.advance();
    //     expect(launchGameMock).toHaveBeenCalled();
    // });

    // it('advance() should showQuestion if the game is in state Show Results', async () => {
    //     game.isLocked = true;
    //     game['advanceState'](GameState.ShowResults);
    //     const askQuestionMock = jest.spyOn(game, 'askQuestion');
    //     await game.advance();
    //     expect(askQuestionMock).toHaveBeenCalled();
    // });

    it('advanceState() should modify the state of the Game', () => {
        game['advanceState'](GameState.AskingQuestion);
        expect(game.currentState).toBe(GameState.AskingQuestion);
    });

    // it('askQuestion() should update the histogram, calculate the scores and advance state', async () => {
    //     const initState = game.currentState;
    //     await game.askQuestion();
    //     const finalState = game.currentState;
    //     expect(finalState).toBeGreaterThanOrEqual(initState);
    // });

    // it('launchGame() should change game state', async () => {
    //     const game = new ActiveGame(mockGameData, 'roomId', jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn());
    //     await game.launchGame();
    //     expect(game.currentState).toBe(GameState.Starting);
    // });

    // it('testGame() should change game state', async () => {
    //     const game = new ActiveGame(mockGameData, 'roomId', jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn());
    //     await game.testGame();
    //     expect(game.currentState).toBe(GameState.Starting);
    // });
});
