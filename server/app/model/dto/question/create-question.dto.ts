import { QuestionType } from '@app/constants';
import { Choice } from '@app/model/database/choice';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    type: QuestionType;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ required: true })
    @IsNumber()
    @IsNotEmpty()
    points: number;

    @ApiProperty()
    choices?: Choice[];
}
