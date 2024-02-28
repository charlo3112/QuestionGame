import { CreatePlayerDto } from '@app/model/dto/player/create-player.dto';
import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Player {
    @ApiProperty()
    @Prop({ required: true })
    private playerId: string;

    @ApiProperty()
    @Prop({ required: true })
    private name: string;

    @ApiProperty()
    @Prop({ required: true })
    private score: number;

    constructor(playerData: CreatePlayerDto) {
        this.playerId = uuidv4();
        this.name = playerData.name;
        this.score = 0;
    }

    addScore(score: number) {
        this.score += score;
    }

    getPlayerId() {
        return this.playerId;
    }

    getScore() {
        return this.score;
    }
}
