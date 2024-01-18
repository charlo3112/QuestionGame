import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';
import { Choice } from '@app/model/database/choice'

export class CreateQuestionDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    descritpion: string;

    @ApiProperty()
    @IsNumber()
    points: number;

    @ApiProperty()
    choices: Choice[];
}
