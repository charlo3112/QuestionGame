import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { Model, Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';

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
        const course = getFakeGame();
        await gameModel.create(course);
        expect((await service.getAllGames()).length).toEqual(1);
    });

    it('getGameById() return game with the specified subject code', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.getGameById(game.getId())).toEqual(expect.objectContaining(game));
    });

    it('modifyCourse() should fail if course does not exist', async () => {
        const course = getFakeGame();
        await expect(service.modifyCourse(course)).rejects.toBeTruthy();
    });

    it('modifyCourse() should fail if mongo query failed', async () => {
        jest.spyOn(GameModel, 'updateOne').mockRejectedValue('');
        const course = getFakeGame();
        await expect(service.modifyCourse(course)).rejects.toBeTruthy();
    });

    it('getCoursesByTeacher() return course with the specified teacher', async () => {
        const course = getFakeGame();
        await GameModel.create(course);
        await GameModel.create(course);
        const courses = await service.getCoursesByTeacher(course.teacher);
        expect(courses.length).toEqual(2);
        expect(courses[0]).toEqual(expect.objectContaining(course));
    });

    it('deleteCourse() should delete the course', async () => {
        await GameModel.deleteMany({});
        const course = getFakeGame();
        await GameModel.create(course);
        await service.deleteCourse(course.subjectCode);
        expect(await GameModel.countDocuments()).toEqual(0);
    });

    it('deleteCourse() should fail if the course does not exist', async () => {
        await GameModel.deleteMany({});
        const course = getFakeGame();
        await expect(service.deleteCourse(course.subjectCode)).rejects.toBeTruthy();
    });

    it('deleteCourse() should fail if mongo query failed', async () => {
        jest.spyOn(GameModel, 'deleteOne').mockRejectedValue('');
        const course = getFakeGame();
        await expect(service.deleteCourse(course.subjectCode)).rejects.toBeTruthy();
    });

    it('addCourse() should add the course to the DB', async () => {
        await GameModel.deleteMany({});
        const course = getFakeGame();
        await service.addCourse({ ...course, subjectCode: 'INF', credits: 5 });
        expect(await GameModel.countDocuments()).toEqual(1);
    });

    it('addCourse() should fail if mongo query failed', async () => {
        jest.spyOn(GameModel, 'create').mockImplementation(async () => Promise.reject(''));
        const course = getFakeGame();
        await expect(service.addCourse({ ...course, subjectCode: 'INF', credits: 5 })).rejects.toBeTruthy();
    });

    it('addCourse() should fail if the course is not a valid', async () => {
        const course = getFakeGame();
        await expect(service.addCourse({ ...course, subjectCode: 'IND', credits: 5 })).rejects.toBeTruthy();
        await expect(service.addCourse({ ...course, subjectCode: 'INF', credits: 90 })).rejects.toBeTruthy();
        await expect(service.addCourse({ ...course, subjectCode: 'IND', credits: 90 })).rejects.toBeTruthy();
    });
});

const getFakeGame = (): Game => ({
    name: getRandomString(),
    credits: 3,
    subjectCode: getRandomString(),
    teacher: getRandomString(),
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
