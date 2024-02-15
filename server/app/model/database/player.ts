import { CreatePlayerDto } from '@app/model/dto/player/create-player.dto';
import { Prop, Schema } from '@nestjs/mongoose';

export type PlayerDocument = Player & Document;

@Schema()
export class Player {
    @Prop({ required: true })
    private name: string;

    @Prop({ required: true })
    private score: number;

    @Prop({ required: true })
    private bonusNumber: number;

    constructor(playerData: CreatePlayerDto) {
        this.name = playerData.name;
        this.score = 0;
        this.bonusNumber = 0;
    }

    addScore(score: number) {
        this.score += score;
    }

    addBonusNumber() {
        this.bonusNumber++;
    }

    getScore() {
        return this.score;
    }

    getBonusNumber() {
        return this.bonusNumber;
    }
}
