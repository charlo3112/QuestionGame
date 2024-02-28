import { Prop, Schema } from '@nestjs/mongoose';
import { Game } from './game';
import { Player } from './player';

export type ActiveGameDocument = ActiveGame & Document;

@Schema()
export class ActiveGame {
    @Prop({ required: true })
    private game: Game;

    @Prop({ required: true })
    private players: Player[];
}
