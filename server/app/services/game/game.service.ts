import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';


@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.gameModel.countDocuments()) === 0) {
            //await this.populateDB();
        }
    }


    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGame(sbjCode: string): Promise<Game> {
        // NB: This can return null if the course does not exist, you need to handle it
        return await this.gameModel.findOne({ subjectCode: sbjCode });
    }

    async addGame(game: CreateGameDto): Promise<void> {
        if (!this.validateCourse(game)) {
            return Promise.reject('Invalid game');
        }
        try {
            await this.gameModel.create(game);
        } catch (error) {
            return Promise.reject(`Failed to insert course: ${error}`);
        }
    }

    async deleteCourse(sbjCode: string): Promise<void> {
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

    async modifyCourse(game: UpdateGameDto): Promise<void> {
        const filterQuery = { subjectCode: game.subjectCode };
        // Can also use replaceOne if we want to replace the entire object
        try {
            const res = await this.gameModel.updateOne(filterQuery, game);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find game');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async getCourseTeacher(sbjCode: string): Promise<string> {
        const filterQuery = { subjectCode: sbjCode };
        // Only get the teacher and not any of the other fields
        try {
            const res = await this.gameModel.findOne(filterQuery, {
                teacher: 1,
            });
            return res.teacher;
        } catch (error) {
            return Promise.reject(`Failed to get data: ${error}`);
        }
    }

    async getCoursesByTeacher(name: string): Promise<Game[]> {
        const filterQuery: FilterQuery<Game> = { teacher: name };
        return await this.gameModel.find(filterQuery);
    }

}
