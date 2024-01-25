import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Question } from '@app/model//database/question';


@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        private readonly logger: Logger,
    ) {};

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGame(id: string): Promise<Game> {
        return await this.gameModel.findOne({ id: id });
    }

    async addGame(gameData: CreateGameDto): Promise<void> {
        if (!this.validateGame(gameData)) {
            return Promise.reject('Invalid game');
        }
        try {
            const game = new Game(gameData);
            await this.gameModel.create(game);
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async deleteGame(sbjCode: string): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({
                subjectCode: sbjCode,
            });
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
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find game');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async validateGame(game: CreateGameDto){
        return game.duration<=60 && game.duration>=10 && game.questions.length>0;
    }

}
