import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Question } from '../../database/question'

export class CreateGameDto {
    @ApiProperty({required: true})
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({required: true})
    @IsString()
    description: string;

    @ApiProperty({required: true})
    @IsNumber()
    @IsNotEmpty()   
    duration: number;

    @ApiProperty({required: true})
    questions: Question[];
}
