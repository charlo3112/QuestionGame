import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameService } from './game.service';

import { MAX_CHOICES_NUMBER, QuestionType } from '@app/constants';
import { Choice } from '@app/model/database/choice';
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';

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
                    provide: getModelToken(Game.name),
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

const DELAY_BEFORE_CLOSING_CONNECTION = 200;
const GAME_DURATION = 40;
const NEW_NUMBER_OF_QUESTIONS = 5;

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
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [GameService, Logger],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
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
    });

    it('getAllGames() return all games in database', async () => {
        await gameModel.deleteMany({});
        expect((await service.getAllGames()).length).toEqual(0);
        const game = getFakeGame();
        await gameModel.create(game);
        expect((await service.getAllGames()).length).toEqual(1);
    });

    it('getGameById() return game with the specified id', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.getGameById(game.getGameId())).toEqual(expect.objectContaining(game));
    });

    it('modifyGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'updateOne').mockRejectedValue('');
        const gameDto = getFakeUpdateGameDto();
        await expect(service.modifyGame(gameDto)).rejects.toBeTruthy();
    });

    it('modifyGame() should create a new game if the provided id has no match', async () => {
        const badGameDto = getBadFakeUpdateGameDto();
        const initDocNb = await gameModel.countDocuments();
        await service.modifyGame(badGameDto);
        expect(await gameModel.countDocuments()).toEqual(initDocNb + 1);
    });

    it('getters should return the correct property of the Game', async () => {
        const game = getFakeGame();
        expect(game.getDescription()).toEqual('test description');
        expect(game.getDuration()).toEqual(GAME_DURATION);
        expect(game.getTitle()).toEqual('test title');
        expect(game.visibility).toEqual(true);
    });

    it('deleteGameById() should fail if the game does not exist', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await expect(service.deleteGameById(game.getGameId())).rejects.toBeTruthy();
    });

    it('addGame() should add the game to the DB', async () => {
        await gameModel.deleteMany({});
        const gameDto = getFakeCreateGameDto();
        await service.addGame(gameDto);
        expect(await gameModel.countDocuments()).toEqual(1);
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

    it('Choice setters should modify the properties of the choice', async () => {
        const choice = getFakeChoices()[0];
        choice.isCorrect = false;
        await expect(choice.getIsCorrect()).toEqual(false);
        choice.text = 'test text';
        await expect(choice.getText()).toEqual('test text');
    });
});

const getFakeCreateGameDto = (): CreateGameDto => {
    const gameData: CreateGameDto = {
        title: 'test title',
        description: 'test description',
        duration: 40,
        questions: getFakeQuestions(),
    };
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
    };
    return gameData;
};

const getFakeGame = (): Game => {
    const game = new Game(getFakeCreateGameDto());
    return game;
};

const getFakeQuestions = (numChoices: number = MAX_CHOICES_NUMBER): Question[] => {
    const questions: Question[] = [];
    for (let i = 0; i < numChoices; i++) {
        const questionData: CreateQuestionDto = {
            type: QuestionType.QCM,
            text: getRandomString(),
            points: 40,
            choices: getFakeChoices(),
        };
        questions.push(new Question(questionData));
    }

    return questions;
};

const getFakeChoices = (numChoices: number = MAX_CHOICES_NUMBER): Choice[] => {
    const choices: Choice[] = [];
    for (let i = 0; i < numChoices; i++) {
        const text = getRandomString();
        const isCorrect = i === 0;
        choices.push(new Choice(text, isCorrect));
    }

    return choices;
};

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
