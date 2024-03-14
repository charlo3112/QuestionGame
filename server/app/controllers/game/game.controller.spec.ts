import { GameData } from '@app/model/database/game';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { GameService } from '@app/services/game/game.service';
import { MAX_CHOICES_NUMBER } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameController } from './game.controller';

describe('GameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllGames() should return all games', async () => {
        const fakeGame: GameData[] = [getFakeGame()];
        gameService.getAllGames.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeGame);
            return res;
        };

        await controller.getAllGames(res);
    });

    it('getAllGames() should return BAD_REQUEST when service unable to fetch games', async () => {
        gameService.getAllGames.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.getAllGames(res);
    });

    it('getGameById() should return the subject code', async () => {
        const fakeGame = getFakeGame();
        gameService.getGameById.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(fakeGame);
            return res;
        };

        await controller.getGameById(fakeGame.getGameId(), res);
    });

    it('getGameById() should return NOT_FOUND when service unable to fetch the game', async () => {
        gameService.getGameById.resolves(null);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getGameById('', res);
    });

    it('getGameById() should return NOT_FOUND when service unable to fetch the game', async () => {
        gameService.getGameById.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.getGameById('', res);
    });

    it('addGame() should succeed if service able to add the game', async () => {
        gameService.addGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addGame(getFakeCreateGameDto(), res);
    });

    it('addGame() should return BAD_REQUEST when service add the game', async () => {
        gameService.addGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.addGame(getFakeCreateGameDto(), res);
    });
    it('modifyGame() should succeed if service able to modify the game', async () => {
        gameService.modifyGame.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyGame(getFakeUpdateGameDto(), res);
    });

    it('modifyGame() should return NOT_MODIFIED when service cannot modify the game', async () => {
        gameService.modifyGame.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_MODIFIED);
            return res;
        };
        res.send = () => res;

        await controller.modifyGame(getFakeUpdateGameDto(), res);
    });

    it('deleteGameById() should succeed if service able to delete the game', async () => {
        const fakeGameDto = getFakeCreateGameDto();
        const fakeGameId = gameService.addGame(fakeGameDto);
        gameService.deleteGameById.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteGameById(await fakeGameId, res);
    });

    it('deleteGameById() should return NOT_FOUND when service cannot delete the game', async () => {
        gameService.deleteGameById.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.deleteGameById('', res);
    });

    it('toggleVisibility() should change the visibility attribute of the Game', async () => {
        const game = getFakeGame();

        gameService.toggleVisibility.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_MODIFIED);
            return res;
        };
        res.send = () => res;

        await controller.toggleVisibility(game.getGameId(), res);
    });

    it('verifyTitle() should return Ok when game is valid', async () => {
        const game = getFakeGame();
        gameService.verifyTitle.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.verifyTitle({ title: game.getTitle() }, res);
    });

    it('verifyTitle() should return BAD_REQUEST when error occurs', async () => {
        gameService.verifyTitle.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.verifyTitle({ title: '' }, res);
    });
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

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
