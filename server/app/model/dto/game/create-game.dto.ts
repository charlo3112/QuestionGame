import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Question } from '../../database/question'

export class CreateGameDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    descritpion: string;

    @ApiProperty()
    @IsNumber()
    duration: number;

    @ApiProperty()
    questions: Question[];
}
