import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Choice {
    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;

    @ApiProperty()
    @Prop({ required: true })
    private text: string;

    constructor(text: string, isCorrect: boolean) {
        if (text !== undefined && text.length > 0) {
            this.text = text;
        }
        this.isCorrect = isCorrect;
    }

    set setText(newText: string) {
        if (newText.length > 0) {
            this.text = newText;
        }
    }

    getText(): string {
        return this.text;
    }
}

export const gameSchema = SchemaFactory.createForClass(Choice);
