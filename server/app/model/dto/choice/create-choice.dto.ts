import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateChoiceDto {
    @ApiProperty({ required: true })
    @IsString()
    text: string;

    @ApiProperty({ required: false })
    @IsBoolean()
    isCorrect: boolean;
}
