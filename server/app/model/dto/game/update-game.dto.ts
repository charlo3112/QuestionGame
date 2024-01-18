import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Question } from '@app/model/database/question';

export class UpdateGameDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    questions?: Question[];
}
