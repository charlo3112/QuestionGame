import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { UserData } from '@app/model/classes/user/user';
import { ChoiceData } from '@app/model/database/choice';
import { GameData } from '@app/model/database/game';
import { QuestionData } from '@app/model/database/question';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { HistoryService } from '@app/services/history/history.service';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ActiveGame } from './active-game';

describe('ActiveGame', () => {
    let mockGameData: GameData;
    let mockRoomId: string;
    let game: ActiveGame;
    let mockHostIsPlaying: boolean;

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

    it('advance() should not start the game if the room in unlocked', async () => {
        game.isLocked = false;
        jest.spyOn(game, 'launchGame');
        await game.advance();
        expect(game.launchGame).not.toHaveBeenCalled();
    });

    // it('advance() should start the game if the room in locked', async () => {
    //     game.isLocked = true;
    //     const launchGameMock = jest.spyOn(game, 'launchGame');
    //     await game.advance();
    //     expect(launchGameMock).toHaveBeenCalled();
    // });

    // it('advance() should showQuestion if the game is in state Show Results', async () => {
    //     game.isLocked = true;
    //     game['advanceState'](GameState.SHOW_RESULTS);
    //     const askQuestionMock = jest.spyOn(game, 'askQuestion');
    //     await game.advance();
    //     expect(askQuestionMock).toHaveBeenCalled();
    // });

    it('advanceState() should modify the state of the Game', () => {
        game['advanceState'](GameState.ASKING_QUESTION_QCM);
        expect(game.currentState).toBe(GameState.ASKING_QUESTION_QCM);
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
    //     expect(game.currentState).toBe(GameState.STARTING);
    // });

    // it('testGame() should change game state', async () => {
    //     const game = new ActiveGame(mockGameData, 'roomId', jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn());
    //     await game.testGame();
    //     expect(game.currentState).toBe(GameState.STARTING);
    // });
});
