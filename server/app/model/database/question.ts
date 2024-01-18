import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Choice } from './choice'

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @ApiProperty()
    @Prop({ required: true })
    type: string;

    @ApiProperty()
    @Prop({ required: true })
    texte: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop({ required: true })
    choices: Choice[];

}

export const questionSchema = SchemaFactory.createForClass(Question);
