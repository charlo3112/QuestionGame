import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsString } from 'class-validator';

export class CreateChoiceDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ required: true })
    @IsBoolean()
    @IsNotEmpty()
    isCorrect: boolean;
}
