import { MAX_DURATION, MIN_DURATION } from '@app/constants';
import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs-extra';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.gameModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        try {
            /*
            const testChoices: Choice[] = [];
            for (let i = 0; i < MAX_CHOICES_NUMBER; i++) {
                const text = 'test text';
                const isCorrect = i === 0;
                testChoices.push(new Choice(text, isCorrect));
            }
            const testQuestions: Question[] = [];
            for (let i = 0; i < MAX_CHOICES_NUMBER; i++) {
                const questionData: CreateQuestionDto = {
                    type: QuestionType.QCM,
                    text: 'test text' + i,
                    points: 40,
                    choices: testChoices,
                };
                testQuestions.push(new Question(questionData));
            }
            const gameData: CreateGameDto = {
                title: 'test title',
                description: 'test description',
                duration: 40,
                questions: testQuestions,
            };
            const game = new Game(gameData);
            await this.gameModel.create(game);
            */
            try {
                const data = await fs.readFile('server/asset/quiz-example', 'utf8');
                const game = JSON.parse(data);
                await this.gameModel.create(game);
            } catch (error) {
                /* empty */
            }
        } catch (error) {
            return Promise.reject(`Failed to populate: ${error}`);
        }
    }

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getAllGamesAdmin(): Promise<Game[]> {
        return await this.gameModel.find({ visibility: true });
    }

    async getGameById(id: string): Promise<Game | null> {
        return await this.gameModel.findOne<Game>({ gameId: id });
    }

    async addGame(gameData: CreateGameDto): Promise<string> {
        try {
            if (!this.validateGame(gameData)) {
                return Promise.reject('Invalid game');
            } else {
                const game = new Game(gameData);
                await this.gameModel.create(game);
                return game.getGameId();
            }
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async toggleVisibility(id: string): Promise<void> {
        try {
            (await this.getGameById(id)).visibility = !(await this.getGameById(id)).visibility;
        } catch (error) {
            return Promise.reject(`Failed to toggle visibility: ${error}`);
        }
    }

    async deleteGameById(id: string): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({ id });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find game');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }

    async modifyGame(game: UpdateGameDto): Promise<void> {
        const filter = { gameId: game.gameId };
        game.lastModification = new Date().toISOString();
        try {
            const res = await this.gameModel.updateOne(filter, game);
            if (!res.matchedCount) {
                const gameData: CreateGameDto = {
                    title: game.title,
                    description: game.description,
                    duration: game.duration,
                    questions: game.questions,
                };
                await this.gameModel.create(new Game(gameData));
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async validateGame(gameData: CreateGameDto) {
        return (
            gameData.duration <= MAX_DURATION &&
            gameData.duration >= MIN_DURATION &&
            gameData.questions.length > 0 &&
            !(await this.gameModel.findOne({ text: gameData.title }))
        );
    }
}
