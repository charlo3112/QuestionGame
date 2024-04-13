import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { QuestionService } from './question.service';

import { ChoiceData } from '@app/model/database/choice';
import { QuestionData, QuestionDocument, questionSchema } from '@app/model/database/question';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { MAX_CHOICES_NUMBER } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';

describe('QuestionService', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;

    beforeEach(async () => {
        questionModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
            replaceOne: jest.fn(),
        } as unknown as Model<QuestionDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionService,
                Logger,
                {
                    provide: getModelToken(QuestionData.name),
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
const POINTS_FOR_QUESTION = 40;
const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('QuestionServiceEndToEnd', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: QuestionData.name, schema: questionSchema }]),
            ],
            providers: [QuestionService, Logger],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
        questionModel = module.get<Model<QuestionDocument>>(getModelToken(QuestionData.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
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

    it('getMongoId() should return the mongoId of the question', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await questionModel.create(question);
        // no choice to acces mongo attribute _id
        // eslint-disable-next-line no-underscore-dangle
        const mongoId = await (await questionModel.findOne({ text: question.getText() }))._id;
        expect(await service.getMongoId(question.getText())).toEqual(mongoId);
    });

    it('getAllQuestions() return all questions in database', async () => {
        await questionModel.deleteMany({});
        expect((await service.getAllQuestions()).length).toEqual(0);
        const question = getFakeQuestion();
        await questionModel.create(question);
        expect((await service.getAllQuestions()).length).toEqual(1);
    });

    it('getAnswers() return the answers of a question', async () => {
        const question = getFakeCreateQuestionDto();
        await service.addQuestion(question);
        const answers = await service.getAnswers(question.text);
        expect(answers[0]).toBe(true);
        expect(answers[1]).toBe(false);
        expect(answers[2]).toBe(false);
        expect(answers[3]).toBe(false);
    });

    it('getAnswers() should return an empty array if the question does not exist', async () => {
        await questionModel.deleteMany({});
        const answers = await service.getAnswers('test');
        expect(answers).toEqual([]);
    });

    it('deleteQuestion() should delete the question', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await questionModel.create(question);
        // eslint-disable-next-line no-underscore-dangle
        const mongoId = await (await questionModel.findOne({ text: question.getText() }))._id;
        await service.deleteQuestion(mongoId);
        expect(await questionModel.countDocuments()).toEqual(0);
    });

    it('deleteQuestion() should fail if the question does not exist', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await expect(service.deleteQuestion(question.getText())).rejects.toBeTruthy();
    });

    it('deleteQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'deleteOne').mockRejectedValue('');
        const question = getFakeQuestion();
        await expect(service.deleteQuestion(question.getText())).rejects.toBeTruthy();
    });

    it('deleteQuestion() should fail if the mongoId is not valid', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await questionModel.create(question);
        await expect(service.deleteQuestion('test')).rejects.toBeTruthy();
    });

    it('deleteQuestion() should fail if the mongoId does not exist', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await questionModel.create(question);
        // eslint-disable-next-line no-underscore-dangle
        const mongoId = await (await questionModel.findOne({ text: question.getText() }))._id;
        await service.deleteQuestion(mongoId);
        await expect(service.deleteQuestion(mongoId)).rejects.toBeTruthy();
    });

    it('addQuestion() should add the question to the DB', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await service.addQuestion({ ...question, type: QuestionType.QCM, text: '5', points: 10, choices: getFakeChoicesDto() });
        expect(await questionModel.countDocuments()).toEqual(1);
    });

    it('addQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'create').mockImplementation(async () => Promise.reject(''));
        const question = getFakeQuestion();
        await expect(
            service.addQuestion({ ...question, type: QuestionType.QCM, text: '5', points: 10, choices: getFakeChoicesDto() }),
        ).rejects.toBeTruthy();
    });

    it('addQuestion() should fail if the question is not a valid', async () => {
        const question = getFakeQuestion();
        await expect(
            service.addQuestion({ ...question, type: QuestionType.QCM, text: 'test question', points: 43, choices: getFakeChoicesDto() }),
        ).rejects.toBeTruthy();
        await expect(
            service.addQuestion({ ...question, type: QuestionType.QCM, text: 'question', points: 200, choices: getFakeChoicesDto() }),
        ).rejects.toBeTruthy();
    });

    it('addQuestion() should fail if the question already exists', async () => {
        const question = getFakeQuestion();
        await questionModel.create(question);
        await expect(
            service.addQuestion({
                ...question,
                type: question.type,
                text: question.getText(),
                points: question.points,
                choices: question.choices,
            }),
        ).rejects.toBeTruthy();
    });

    it('modifyQuestion() should modify the Question attribute', async () => {
        const questionData = getFakeCreateQuestionDto();
        await questionModel.create(new QuestionData(questionData));
        // eslint-disable-next-line no-underscore-dangle
        const mongoId = await (await questionModel.findOne({ text: questionData.text }))._id;
        questionData.mongoId = mongoId;
        const newText = 'new Text';
        questionData.text = newText;
        await service.modifyQuestion(questionData);
        expect(await (await questionModel.findOne<QuestionData>({ _id: mongoId })).text).toBe(newText);
    });

    it('setters should modify Question properties', async () => {
        const question = getFakeQuestion();
        question.setPoints(POINTS_FOR_QUESTION);
        expect(question.getPoints()).toEqual(POINTS_FOR_QUESTION);
        question.setText('new text');
        expect(question.getText()).toEqual('new text');
        const newChoices = getFakeChoices();
        question.setChoices(newChoices);
        expect(question.getChoices()).toEqual(newChoices);
    });

    it('modifyQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'replaceOne').mockRejectedValue('');
        const question = getFakeQuestion();
        await questionModel.create(new QuestionData(question));
        // eslint-disable-next-line no-underscore-dangle
        const mongoId = await (await questionModel.findOne({ text: question.text }))._id;
        question.mongoId = mongoId;
        await expect(service.modifyQuestion(question)).rejects.toBeTruthy();
    });

    it('modifyQuestion() should fail if the question is not valid', async () => {
        const INVALID_POINTS = 200;
        const question = getFakeQuestion();
        await questionModel.create(new QuestionData(question));
        // eslint-disable-next-line no-underscore-dangle
        const mongoId = await (await questionModel.findOne({ text: question.text }))._id;
        question.mongoId = mongoId;
        question.setPoints(INVALID_POINTS);
        await expect(service.modifyQuestion(question)).rejects.toBeTruthy();
    });

    it('getAllQCMQuestions() should return all QCM questions', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await questionModel.create(question);
        expect((await service.getAllQCMQuestions()).length).toEqual(1);
    });
});

const getFakeCreateQuestionDto = (): CreateQuestionDto => {
    const questionData: CreateQuestionDto = {
        type: QuestionType.QCM,
        text: getRandomString(),
        points: 40,
        choices: getFakeChoicesDto(),
    };
    return questionData;
};

const getFakeQuestion = (): QuestionData => {
    const questionData: CreateQuestionDto = {
        type: QuestionType.QCM,
        text: getRandomString(),
        points: 40,
        choices: getFakeChoicesDto(),
    };

    const question = new QuestionData(questionData);

    return question;
};

const getFakeChoices = (numChoices: number = MAX_CHOICES_NUMBER): ChoiceData[] => {
    const choices: ChoiceData[] = [];
    for (let i = 0; i < numChoices; i++) {
        const choiceData: CreateChoiceDto = {
            text: getRandomString(),
            isCorrect: i === 0,
        };
        choices.push(new ChoiceData(choiceData));
    }

    return choices;
};

const getFakeChoicesDto = (numChoices: number = MAX_CHOICES_NUMBER): CreateChoiceDto[] => {
    const choices: CreateChoiceDto[] = [];
    for (let i = 0; i < numChoices; i++) {
        const text = getRandomString();
        const isCorrect = i === 0;
        choices.push({ text, isCorrect } as CreateChoiceDto);
    }

    return choices;
};

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
