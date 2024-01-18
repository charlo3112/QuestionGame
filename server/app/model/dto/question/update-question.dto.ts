import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Choice } from '@app/model/database/choice';

export class UpdateQuestionDto {
    @ApiProperty({ required: false})
    @IsOptional()
    @IsString()
    text?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    points?: number;


    @ApiProperty({ required: false })
    @IsOptional()
    choices?: Choice[];
}
