import { MAX_DURATION, MIN_DURATION } from '@app/constants';
import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        private readonly logger: Logger,
    ) {}

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getAllGamesAdmin(): Promise<Game[]> {
        return await this.gameModel.find({ visibility: true });
    }

    async getGameById(id: string): Promise<Game> {
        return await this.gameModel.findOne({ id });
    }

    async addGame(gameData: CreateGameDto): Promise<string> {
        try {
            if (!this.validateGame(gameData)) {
                return Promise.reject('Invalid game');
            } else {
                const game = new Game(gameData);
                await this.gameModel.create(game);
                return game.getId();
            }
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
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
        const filter = { id: game.id };
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
                await this.gameModel.create(gameData);
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
