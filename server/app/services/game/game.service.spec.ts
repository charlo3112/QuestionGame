import { MAX_CHOICES_NUMBER, QuestionType } from '@app/constants';
import { Choice } from '@app/model/database/choice';
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionService } from '@app/services/question/question.service';
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
    let questionModel: Model<QuestionDocument>;

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

        questionModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<QuestionDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                QuestionService,
                Logger,
                {
                    provide: getModelToken(Game.name),
                    useValue: gameModel,
                },
                {
                    provide: getModelToken(Question.name),
                    useValue: questionModel,
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
const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('GameServiceEndToEnd', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let questionModel: Model<QuestionDocument>;
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
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
                MongooseModule.forFeature([{ name: Question.name, schema: gameSchema }]),
            ],
            providers: [GameService, QuestionService, Logger],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        questionModel = module.get<Model<QuestionDocument>>(getModelToken(Question.name));
        connection = await module.get(getConnectionToken());
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
        expect(questionModel).toBeDefined();
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

    it('getAllGames() return all games in database', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        const modelGameNb = await gameModel.countDocuments();
        const serviceGames = await service.getAllGames();
        expect(serviceGames.length).toEqual(modelGameNb);
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
        const badGameDto = getBadFakeUpdateGameDto();
        await service.modifyGame(badGameDto);
        expect(await gameModel.countDocuments()).toEqual(1);
    });

    it('getters should return the correct property of the Game', async () => {
        const game = getFakeGame();
        expect(game.getDescription()).toEqual('test description');
        expect(game.getDuration()).toEqual(GAME_DURATION);
        expect(game.getTitle()).toEqual('test title');
        expect(game.visibility).toEqual(true);
    });

    it('deleteGameById() should fail if the game does not exist', async () => {
        const game = getFakeGame();
        expect(await service.deleteGameById(game.getGameId())).rejects.toBeTruthy();
    });

    it('addGame() should add the game to the DB', async () => {
        const gameDto = getFakeCreateGameDto();
        await service.addGame(gameDto);
        const finalGameNb = await gameModel.countDocuments();
        expect(await gameModel.countDocuments()).toEqual(finalGameNb);
    });

    it('addGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        const gameDto = getFakeCreateGameDto();
        await expect(service.addGame(gameDto)).rejects.toBeTruthy();
    });

    it('addQuestion() should add a new question to the game', async () => {
        const game = getFakeGame();
        game.addQuestion(getFakeQuestions()[0]);
        await expect(game.getQuestions().length).toEqual(NEW_NUMBER_OF_QUESTIONS);
    });

    it('Choice setter should modify the properties of the choice', async () => {
        const choiceData: CreateChoiceDto = {
            text: 'old text',
            isCorrect: true,
        };
        const choice = new Choice(choiceData);
        choice.setText = 'test text';
        await expect(choice.getText()).toEqual('test text');
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

const getFakeGame = (): Game => {
    const game = new Game(getFakeCreateGameDto());
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
