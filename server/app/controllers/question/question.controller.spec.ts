import { QuestionController } from '@app/controllers/question/question.controller';
import { Question } from '@app/model/database/question';
import { ChoiceDto } from '@app/model/dto/choice/choice-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { MAX_CHOICES_NUMBER, QuestionType } from '@common/constants';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe.only('QuestionController', () => {
    let controller: QuestionController;
    let questionService: SinonStubbedInstance<QuestionService>;

    beforeEach(async () => {
        questionService = createStubInstance(QuestionService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionController],
            providers: [
                {
                    provide: QuestionService,
                    useValue: questionService,
                },
            ],
        }).compile();

        controller = module.get<QuestionController>(QuestionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getQuestions() should return all questions', async () => {
        const fakeQuestions = getFakeQuestions();
        questionService.getAllQuestions.resolves(fakeQuestions);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeQuestions);
            return res;
        };

        await controller.getAllQuestions(res);
    });

    it('addQuestion() should succeed if service able to add the course', async () => {
        questionService.addQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        const fakeQuestionData: CreateQuestionDto = {
            type: QuestionType.QCM,
            text: getRandomString(),
            points: 40,
            choices: getFakeChoices(),
        };

        await controller.addQuestion(fakeQuestionData, res);
    });

    it('addQuestion() should return NOT_FOUND when service add the course', async () => {
        questionService.addQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        const fakeQuestionData: CreateQuestionDto = {
            type: QuestionType.QCM,
            text: getRandomString(),
            points: 40,
            choices: getFakeChoices(),
        };

        await controller.addQuestion(fakeQuestionData, res);
    });

    it('deleteQuestion() should succeed if service able to delete the question', async () => {
        questionService.deleteQuestion.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteQuestion('', res);
    });

    it('deleteQuestion() should return NOT_FOUND when service cannot delete the question', async () => {
        questionService.deleteQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteQuestion('', res);
    });
});

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

const getFakeChoices = (numChoices: number = MAX_CHOICES_NUMBER): ChoiceDto[] => {
    const choices: ChoiceDto[] = [];
    for (let i = 0; i < numChoices; i++) {
        const text = getRandomString();
        const isCorrect = i === 0;
        choices.push({ text, isCorrect });
    }

    return choices;
};

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
