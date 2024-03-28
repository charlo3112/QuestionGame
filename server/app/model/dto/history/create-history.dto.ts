import { History } from '@common/interfaces/history';
import { Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

@Schema()
export class CreateHistoryDto implements History {
    @ApiProperty({ required: true })
    @IsString()
    name: string;

    @ApiProperty({ required: true })
    @IsString()
    date: Date;

    @ApiProperty({ required: true })
    @IsNumber()
    numberPlayers: number;

    @ApiProperty({ required: true })
    @IsNumber()
    bestScore: number;
}
