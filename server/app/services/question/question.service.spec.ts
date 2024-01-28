import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from './question.service';
import { Model, Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Question, QuestionDocument, questionSchema } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { Choice } from '@app/model/database/choice';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MAX_CHOICES_NUMBER, QuestionType } from '@app/constants';

/**
 * There is two way to test the service :
 * - Mock the mongoose Model implementation and do what ever we want to do with it (see describe CourseService) or
 * - Use mongodb memory server implementation (see describe CourseServiceEndToEnd) and let everything go through as if we had a real database
 *
 * The second method is generally better because it tests the database queries too.
 * We will use it more
 */

describe('QuestionService', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;

    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
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
                QuestionService,
                Logger,
                {
                    provide: getModelToken(Question.name),
                    useValue: questionModel,
                },
            ],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('QuestionServiceEndToEnd', () => {
    let service: QuestionService;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        let questionModel: Model<QuestionDocument>;
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
                MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
            ],
            providers: [QuestionService, Logger],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
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
        expect(questionModel).toBeDefined();
    });

    it('getAllQuestions() return all questions in database', async () => {
        await questionModel.deleteMany({});
        expect((await service.getAllQuestions()).length).toEqual(0);
        const question = getFakeQuestion();
        await questionModel.create(question);
        expect((await service.getAllQuestions()).length).toEqual(1);
    });

    it('deleteQuestion() should delete the question', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await questionModel.create(question);
        await service.deleteQuestion(question.text);
        expect(await questionModel.countDocuments()).toEqual(0);
    });

    it('deleteQuestion() should fail if the question does not exist', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await expect(service.deleteQuestion(question.text)).rejects.toBeTruthy();
    });

    it('deleteQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'deleteOne').mockRejectedValue('');
        const question = getFakeQuestion();
        await expect(service.deleteQuestion(question.text)).rejects.toBeTruthy();
    });

    it('addQuestion() should add the question to the DB', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await service.addQuestion({ ...question, type: QuestionType.QCM, text: '5', points: 10 });
        expect(await questionModel.countDocuments()).toEqual(1);
    });

    it('addCourse() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'create').mockImplementation(async () => Promise.reject(''));
        const question = getFakeQuestion();
        await expect(service.addQuestion({ ...question, type: QuestionType.QCM, text: '5', points: 10 })).rejects.toBeTruthy();
    });

    it('addCourse() should fail if the course is not a valid', async () => {
        const question = getFakeQuestion();
        await expect(service.addQuestion({ ...question, type: QuestionType.QCM, text: '5', points: 43 })).rejects.toBeTruthy();
        await expect(service.addQuestion({ ...question, type: QuestionType.QRL, text: '5', points: 0 })).rejects.toBeTruthy();
        await expect(service.addQuestion({ ...question, type: QuestionType.QCM, text: '5', points: 200 })).rejects.toBeTruthy();
    });
});

const getFakeQuestion = (): Question => {
    const questionData: CreateQuestionDto = {
        type: QuestionType.QCM,
        text: getRandomString(),
        points: 40,
        choices: getFakeChoices(),
    };

    const question = new Question(questionData);

    return question;
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
