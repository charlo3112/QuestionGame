import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { ChoiceData } from './choice';

export type QuestionDocument = QuestionData & Document;

export type QuestionDataAsQuestion = QuestionData & Question;

@Schema()
export class QuestionData {
    @ApiProperty()
    @Prop({ required: false })
    mongoId?: string;

    @ApiProperty()
    @Prop({ required: false })
    choices?: ChoiceData[];

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    type: QuestionType;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop({ required: true })
    private lastModification: Date;

    _id: string;

    constructor(questionData: CreateQuestionDto) {
        this.type = questionData.type;
        this.text = questionData.text;
        this.points = questionData.points;
        this.lastModification = new Date();
        this.choices = questionData.choices?.map((choiceData) => {
            return new ChoiceData(choiceData);
        });
    }

    get questionDataAsQuestion(): QuestionDataAsQuestion {
        return this as QuestionDataAsQuestion;
    }

    setPoints(points: number) {
        if (points > 0) {
            this.points = points;
        }
    }

    setText(newText: string) {
        if (newText.length > 0) {
            this.text = newText;
        }
    }

    setChoices(newChoices: ChoiceData[]) {
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

    getChoices(): ChoiceData[] | undefined {
        return this.choices;
    }

    getLastModification(): Date {
        return this.lastModification;
    }
}

export const questionSchema = SchemaFactory.createForClass(QuestionData);
