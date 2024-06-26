import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGameDto {
    @ApiProperty({ required: true })
    @IsString()
    gameId: string;

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
    @IsString()
    lastModification?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    questions?: CreateQuestionDto[];
}
