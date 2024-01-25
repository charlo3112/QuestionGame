import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Choice } from './choice'
import { CreateQuestionDto } from '../dto/question/create-question.dto';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @ApiProperty()
    @Prop({ required: true })
    type: string;

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop({ required: false })
    choices?: Choice[];

    constructor(dto: CreateQuestionDto) {
        this.type = dto.type;
        this.text = dto.text;
        this.points = dto.points;
        this.choices = dto.choices.map(choiceDto => new Choice(choiceDto));
    }

}

export const questionSchema = SchemaFactory.createForClass(Question);
