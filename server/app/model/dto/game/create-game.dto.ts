import { Question } from '@app/model/database/question';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ required: true })
    @IsString()
    description: string;

    @ApiProperty({ required: true })
    @IsNumber()
    @IsNotEmpty()
    duration: number;

    @ApiProperty({ required: true })
    questions: Question[];
}
