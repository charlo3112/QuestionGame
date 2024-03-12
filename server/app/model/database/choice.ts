import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { Choice } from '@common/interfaces/choice';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class ChoiceData implements Choice {
    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    constructor(choiceData: CreateChoiceDto) {
        if (choiceData.text !== undefined && choiceData.text.length > 0) {
            this.text = choiceData.text;
        }
        this.isCorrect = choiceData.isCorrect;
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

export const gameSchema = SchemaFactory.createForClass(ChoiceData);
