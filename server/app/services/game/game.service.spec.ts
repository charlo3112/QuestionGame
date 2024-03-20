import { ChoiceData } from '@app/model/database/choice';
import { GameData, GameDocument, gameSchema } from '@app/model/database/game';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { MAX_CHOICES_NUMBER } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { Logger } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameService } from './game.service';

/**
 * There is two way to test the service :
 * - Mock the mongoose Model implementation and do what ever we want to do with it (see describe CourseService) or
 * - Use mongodb memory server implementation (see describe CourseServiceEndToEnd) and let everything go through as if we had a real database
 *
 * The second method is generally better because it tests the database queries too.
 * We will use it more
 */

describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;

    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        gameModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<GameDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                Logger,
                {
                    provide: getModelToken(GameData.name),
                    useValue: gameModel,
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

const GAME_DURATION = 40;
const NEW_NUMBER_OF_QUESTIONS = 5;
const DELAY_BEFORE_CLOSING_CONNECTION = 400;

describe('GameServiceEndToEnd', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: GameData.name, schema: gameSchema }]),
            ],
            providers: [GameService, Logger],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(GameData.name));
        connection = await module.get(getConnectionToken());
        gameModel.deleteMany({});
    });

    afterEach((done) => {
        // The database get auto populated in the constructor
        // We want to make sur we close the connection after the database got
        // populated. So we add small delay
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    it('start() should populate the database when there is no data', async () => {
        await gameModel.deleteMany({});
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        gameModel.countDocuments = jest.fn().mockResolvedValue(0);
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('start() should not populate the DB when there is some data', async () => {
        const course = getFakeGame();
        await gameModel.create(course);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        gameModel.countDocuments = jest.fn().mockResolvedValue(1);
        await service.start();
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });

    it('getAllGames() return all visible games in database', async () => {
        const game1 = getFakeGame();
        game1.visibility = false;
        await gameModel.create(game1);
        const game2 = getFakeGame();
        await gameModel.create(game2);
        const serviceGames = await service.getAllGames();
        expect(serviceGames.length).toBe(1);
    });

    it('getAllGamesAdmin() return all games in database', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        const game2 = getFakeGame();
        await gameModel.create(game2);
        const serviceGames = await service.getAllGamesAdmin();
        expect(serviceGames.length).toBe(2);
    });

    it('getGameById() return game with the specified id', async () => {
        const game = getFakeGame();
        await gameModel.create(game);

        const retrievedGame = await service.getGameById(game.getGameId());

        expect(retrievedGame).toEqual(expect.objectContaining(game));
    });

    it('modifyGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'updateOne').mockRejectedValue('');
        const gameDto = getFakeUpdateGameDto();
        await expect(service.modifyGame(gameDto)).rejects.toBeTruthy();
    });

    it('modifyGame() should create a new game if the provided id has no match', async () => {
        await gameModel.deleteMany({});
        const badGameDto = getBadFakeUpdateGameDto();
        await service.modifyGame(badGameDto);
        expect(await gameModel.countDocuments()).toBe(1);
    });

    it('getters should return the correct property of the Game', async () => {
        const game = getFakeGame();
        expect(game.getDescription()).toBe('test description');
        expect(game.getDuration()).toBe(GAME_DURATION);
        expect(game.getTitle()).toBe('test title');
        expect(game.visibility).toBe(true);
    });

    it('toggleVisibility() should toggle the game visiblity', async () => {
        const game = getFakeGame();
        game.visibility = false;
        await gameModel.create(game);
        await service.toggleVisibility(game.getGameId());
        expect((await gameModel.findOne({ gameId: game.getGameId() })).visibility).toBe(true);
    });

    it('deleteGameById() should delete the game', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.deleteGameById(game.getGameId())).toBeGreaterThan(0);
    });

    it('deleteGameById() should fail if the game does not exist', async () => {
        const game = getFakeGame();
        expect(await service.deleteGameById(game.getGameId())).toBe(0);
    });

    it('addGame() should add the game to the DB', async () => {
        await gameModel.deleteMany({});
        const gameDto = getFakeCreateGameDto();
        await service.addGame(gameDto);
        const finalGameNb = await gameModel.countDocuments();
        expect(await gameModel.countDocuments()).toBe(finalGameNb);
    });

    it('addGame() should fail if the game data is invalid', async () => {
        const gameDto = getFakeCreateGameDto();
        gameDto.duration = 1234567;
        expect(await service.addGame(gameDto)).toBe('');
    });

    it('addQuestion() should add a new question to the game', async () => {
        const game = getFakeGame();
        game.addQuestion(getFakeQuestions()[0]);
        expect(game.getQuestions().length).toBe(NEW_NUMBER_OF_QUESTIONS);
    });

    it('Choice setter should modify the properties of the choice', async () => {
        const choiceData: CreateChoiceDto = {
            text: 'old text',
            isCorrect: true,
        };
        const choice = new ChoiceData(choiceData);
        choice.setText = 'test text';
        expect(choice.getText()).toBe('test text');
    });
});

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

const getFakeUpdateGameDto = (): UpdateGameDto => {
    const gameData: UpdateGameDto = {
        gameId: getRandomString(),
        title: getRandomString(),
        description: getRandomString(),
        duration: 30,
        questions: getFakeQuestions(),
    };
    return gameData;
};

const getBadFakeUpdateGameDto = (): UpdateGameDto => {
    const gameData: UpdateGameDto = {
        gameId: 'l',
        title: getRandomString(),
        description: getRandomString(),
        duration: 30,
        questions: getFakeQuestions(),
    } as UpdateGameDto;
    return gameData;
};

const getFakeGame = (): GameData => {
    const game = new GameData(getFakeCreateGameDto());
    return game;
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
