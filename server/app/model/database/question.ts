import { QuestionType } from '@app/constants';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Choice } from './choice';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @ApiProperty()
    @Prop({ required: true })
    private type: QuestionType;

    @ApiProperty()
    @Prop({ required: true })
    private text: string;

    @ApiProperty()
    @Prop({ required: true })
    private points: number;

    @ApiProperty()
    @Prop({ required: true })
    private lastModification: Date;

    @ApiProperty()
    @Prop({ required: true })
    private choices?: Choice[];

    constructor(questionData: CreateQuestionDto) {
        this.type = questionData.type;
        this.text = questionData.text;
        this.points = questionData.points;
        this.lastModification = new Date();
        this.choices = questionData.choices?.map((choiceData) => {
            return new Choice(choiceData);
        });
    }

    set setPoints(points: number) {
        if (points > 0) {
            this.points = points;
        }
    }

    set setText(newText: string) {
        if (newText.length > 0) {
            this.text = newText;
        }
    }

    set setChoices(newChoices: Choice[]) {
        if (newChoices.length > 0) {
            this.choices = newChoices;
        }
    }

    getType(): QuestionType {
        return this.type;
    }

    getText(): string {
        return this.text;
    }

    getPoints(): number {
        return this.points;
    }

    getChoices(): Choice[] | undefined {
        return this.choices;
    }

    getLastModification(): Date {
        return this.lastModification;
    }
}

export const questionSchema = SchemaFactory.createForClass(Question);
