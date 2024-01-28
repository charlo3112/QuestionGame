import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Choice } from './choice';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionType } from '@app/constants';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    #type: QuestionType;
    #text: string;
    #points: number;
    #choices?: Choice[];

    constructor(questionData: CreateQuestionDto) {
        this.#type = questionData.type;
        this.#text = questionData.text;
        this.#points = questionData.points;
        this.#choices = questionData.choices?.map((choiceData) => new Choice(choiceData.text, choiceData.isCorrect));
    }

    set points(points: number) {
        if (points > 0) {
            this.#points = points;
        }
    }

    set text(newText: string) {
        if (newText.length > 0) {
            this.#text = newText;
        }
    }

    set choices(newChoices: Choice[]) {
        if (newChoices.length > 0) {
            this.#choices = newChoices;
        }
    }

    getType(): QuestionType {
        return this.#type;
    }

    getText(): string {
        return this.#text;
    }

    getPoints(): number {
        return this.#points;
    }

    getChoices(): Choice[] | undefined {
        return this.#choices;
    }
}

export const questionSchema = SchemaFactory.createForClass(Question);
