import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateChoiceDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isCorrect?: boolean;

}
