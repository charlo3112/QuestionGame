import { GameData } from '@app/model/database/game';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { GameService } from '@app/services/game/game.service';
import { MAX_CHOICES_NUMBER, QuestionType } from '@common/constants';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
    let controller: AdminController;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<AdminController>(AdminController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('login() should return OK when password is correct', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        process.env.ADMIN_PASSWORD = 'password';
        await controller.login({ password: 'password' }, res);
    });

    it('login() should return FORBIDDEN when password is incorrect', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.FORBIDDEN);
            return res;
        };
        res.send = () => res;

        process.env.ADMIN_PASSWORD = 'password';
        await controller.login({ password: 'wrong' }, res);
    });

    it('should return Ok when get all games admin', async () => {
        const fakeGame: GameData[] = [getFakeGame()];
        gameService.getAllGamesAdmin.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeGame);
            return res;
        };

        await controller.getAllGamesAdmin(res);
    });

    it('should return NOT_FOUND when service unable to fetch games', async () => {
        gameService.getAllGamesAdmin.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getAllGamesAdmin(res);
    });

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

    const getFakeCreateGameDto = (): CreateGameDto => {
        const gameData: CreateGameDto = {
            title: getRandomString(),
            description: getRandomString(),
            duration: 40,
            questions: getFakeQuestions(),
            visibility: true,
        };
        return gameData;
    };

    const BASE_36 = 36;
    const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
});
