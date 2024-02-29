import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePlayerDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: true })
    @IsNumber()
    @IsNotEmpty()
    score: number;

    @ApiProperty({ required: true })
    @IsNumber()
    @IsNotEmpty()
    bonus: number;
}
