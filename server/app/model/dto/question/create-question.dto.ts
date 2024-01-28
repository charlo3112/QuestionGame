import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Choice } from '@app/model/database/choice';

export class CreateQuestionDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    type: string;

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
