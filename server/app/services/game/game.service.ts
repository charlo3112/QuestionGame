import { Game, GameDocument } from '@app/model/database/game';
import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { MAX_DURATION, MIN_DURATION } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs-extra';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
        private readonly questionService: QuestionService,
        @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
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
            const jsonData = await fs.readFile('assets/quiz-example.json', 'utf8');
            const gameData = JSON.parse(jsonData);
            const gameDto: CreateGameDto = {
                title: gameData.title,
                description: gameData.description,
                duration: gameData.duration,
                questions: gameData.questions as CreateQuestionDto[],
                visibility: true,
            };
            await this.addGame(gameDto);
        } catch (error) {
            return Promise.reject(`Failed to populate: ${error}`);
        }
    }

    async getAllGames(): Promise<Game[]> {
        const games = await this.gameModel.find({ visibility: true });
        return games || [];
    }

    async getAllGamesAdmin(): Promise<Game[]> {
        const games = await this.gameModel.find({});
        return games || [];
    }

    async getGameById(id: string): Promise<Game | null> {
        return await this.gameModel.findOne<Game>({ gameId: id });
    }

    async addGame(gameData: CreateGameDto): Promise<string> {
        try {
            if (!this.validateGame(gameData)) {
                return Promise.reject('Invalid game');
            }
            const game = new Game(gameData);
            await this.gameModel.create(game);
            return game.getGameId();
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async toggleVisibility(id: string): Promise<void> {
        try {
            const game = await this.getGameById(id);
            game.visibility = !game.visibility;
            await this.gameModel.updateOne({ gameId: id }, game);
        } catch (error) {
            return Promise.reject(`Failed to toggle visibility: ${error}`);
        }
    }

    async deleteGameById(id: string): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({ gameId: id });
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
                    visibility: true,
                };
                await this.addGame(gameData);
                return;
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
            !(await this.gameModel.findOne({ title: gameData.title }))
        );
    }

    async verifyTitle(title: string): Promise<boolean> {
        return (await this.gameModel.findOne({ title })) ? true : false;
    }
}
