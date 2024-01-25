import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { CreateChoiceDto } from '../dto/choice/create-choice.dto';


@Schema()
export class Choice {
    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;

    constructor(dto: CreateChoiceDto) {
        this.text = dto.text;
        this.isCorrect = dto.isCorrect;
    }

    setText(newText: string){
        if(newText.length>0){
            this.text = newText;
            return true;
        }
        else return false;
    }

}

