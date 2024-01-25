import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Choice } from '@app/model/database/choice';

export class CreateQuestionDto {
    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsString()
    text: string;

    @ApiProperty()
    @IsNumber()
    points: number;

    @ApiProperty()
    choices?: Choice[];
}
