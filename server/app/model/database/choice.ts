import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';


@Schema()
export class Choice {
    @ApiProperty()
    @Prop({ required: true })
    choice: string;

    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;

}

