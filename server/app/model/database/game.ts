import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { Game } from '@common/interfaces/game';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { QuestionData, QuestionDataAsQuestion } from './question';

export type GameDocument = GameData & Document;

@Schema()
export class GameData implements Game {
    @ApiProperty()
    @Prop({ required: true })
    visibility: boolean = false;

    @ApiProperty()
    @Prop({ required: true })
    gameId: string;

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
    questions: QuestionDataAsQuestion[];

    constructor(gameData: CreateGameDto) {
        this.gameId = uuidv4();
        this.title = gameData.title;
        this.description = gameData.description;
        this.duration = gameData.duration;
        this.lastModification = new Date().toISOString();
        this.questions = gameData.questions.map((questionData) => {
            return new QuestionData(questionData).questionDataAsQuestion;
        });

        this.visibility = false;
        if (gameData.visibility) {
            this.visibility = gameData.visibility;
        }
    }

    addQuestion(newQuestion: CreateQuestionDto) {
        this.questions.push(new QuestionData(newQuestion).questionDataAsQuestion);
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

    getQuestions(): QuestionData[] {
        return this.questions;
    }
}

export const gameSchema = SchemaFactory.createForClass(GameData);
