import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Question } from './question';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    visibility: boolean = true;

    @ApiProperty()
    @Prop({ required: true })
    private gameId: string;

    @ApiProperty()
    @Prop({ required: true })
    private title: string;

    @ApiProperty()
    @Prop({ required: true })
    private description: string;

    @ApiProperty()
    @Prop({ required: true })
    private duration: number;

    @ApiProperty()
    @Prop({ required: true })
    private lastModification: string;

    @ApiProperty()
    @Prop({ required: true })
    private questions: Question[];

    constructor(gameData: CreateGameDto) {
        this.gameId = uuidv4();
        this.title = gameData.title;
        this.description = gameData.description;
        this.duration = gameData.duration;
        this.lastModification = new Date().toISOString();
        this.questions = gameData.questions;
        this.visibility = true;
    }

    addQuestion(newQuestion: Question) {
        this.questions.push(newQuestion);
    }

    getGameId(): string {
        return this.gameId;
    }

    getTitle(): string {
        return this.title;
    }

    getDescription(): string {
        return this.description;
    }

    getDuration(): number {
        return this.duration;
    }

    getLastModification(): string {
        return this.lastModification;
    }

    getQuestions(): Question[] {
        return this.questions;
    }
}

export const gameSchema = SchemaFactory.createForClass(Game);
