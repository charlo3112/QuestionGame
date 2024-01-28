import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Date, Document } from 'mongoose';
import { Question } from './question';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { v4 as uuidv4 } from 'uuid';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    id: string;

    @ApiProperty()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true })
    duration: number;

    @ApiProperty()
    @Prop({ required: true })
    lastModification: string;

    @ApiProperty()
    @Prop({ required: true })
    questions: Question[];

    constructor(gameData: CreateGameDto) {
        this.id = uuidv4();
        this.title = gameData.title;
        this.description = gameData.description;
        this.duration = gameData.duration;
        this.lastModification = new Date().toISOString();
        this.questions = gameData.questions.map((questionDto) => new Question(questionDto));
    }

    addQuestion(newQuestion: Question) {
        const size = this.questions.length;
        if (size < this.questions.push(newQuestion)) return true;
        else return false;
    }
}

export const gameSchema = SchemaFactory.createForClass(Game);
