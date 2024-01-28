import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Choice } from './choice';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';

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

    constructor(questionData: CreateQuestionDto) {
        this.type = questionData.type;
        this.text = questionData.text;
        this.points = questionData.points;
        this.choices = questionData.choices.map((choiceDto) => new Choice(choiceDto));
    }

    setPoints(points: number) {
        if (points > 0) {
            this.points = points;
            return true;
        } else return false;
    }

    setText(newText: string) {
        if (newText.length > 0) {
            this.text = newText;
            return true;
        } else return false;
    }

    setChoices(newChoices: Choice[]) {
        if (newChoices.length > 0) {
            this.choices = newChoices;
            return true;
        } else return false;
    }
}

export const questionSchema = SchemaFactory.createForClass(Question);
