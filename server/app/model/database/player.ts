import { CreatePlayerDto } from '@app/model/dto/player/create-player.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

    @ApiProperty()
    @Prop({ required: true })
    private bonus: number;

    constructor(playerData: CreatePlayerDto) {
        this.playerId = uuidv4();
        this.name = playerData.name;
        this.score = playerData.score;
        this.bonus = playerData.bonus;
    }

    addScore(score: number) {
        this.score += score;
    }

    addBonus(bonus: number) {
        this.bonus += bonus;
    }

    getPlayerId() {
        return this.playerId;
    }

    getName() {
        return this.name;
    }

    getScore() {
        return this.score;
    }

    getBonus() {
        return this.bonus;
    }
}

export const playerSchema = SchemaFactory.createForClass(Player);
