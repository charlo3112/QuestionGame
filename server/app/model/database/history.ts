import { CreateHistoryDto } from '@app/model/dto/history/create-history.dto';
import { History } from '@common/interfaces/history';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type HistoryDocument = HistoryData & Document;

@Schema()
export class HistoryData implements History {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    date: string;

    @ApiProperty()
    @Prop({ required: true })
    numberPlayers: number;

    @ApiProperty()
    @Prop({ required: true })
    bestScore: number;

    constructor(historyData: CreateHistoryDto) {
        this.name = historyData.name;
        this.date = historyData.date;
        this.numberPlayers = historyData.numberPlayers;
        this.bestScore = historyData.bestScore;
    }
}

export const historySchema = SchemaFactory.createForClass(HistoryData);
