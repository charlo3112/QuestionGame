import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Date, Document } from 'mongoose';
import { Question } from './question'
import { CreateGameDto } from '../dto/game/create-game.dto';
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
    lastModification: String;

    @ApiProperty()
    @Prop({ required: true })
    questions: Question[];

    constructor(dto: CreateGameDto) {
        this.id = uuidv4();
        this.title = dto.title;
        this.description = dto.description;
        this.duration = dto.duration;
        this.lastModification = new Date().toISOString();
        this.questions = dto.questions.map(questionDto => new Question(questionDto));
    }
}

export const gameSchema = SchemaFactory.createForClass(Game);
