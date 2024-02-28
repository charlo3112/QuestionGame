import { CreateActiveGameDto } from '@app/model/dto/active-game/create-active-game.dto';
import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Game } from './game';
import { Player } from './player';

export type ActiveGameDocument = ActiveGame & Document;

@Schema()
export class ActiveGame {
    @ApiProperty()
    @Prop({ required: true })
    private game: Game;

    @ApiProperty()
    @Prop({ required: true })
    private playersHashMap: { [key: number]: Player };

    constructor(gameData: CreateActiveGameDto) {
        this.game = gameData.game;
        this.playersHashMap = {};
    }
    addPlayer(player: Player) {
        this.playersHashMap[player.getPlayerId()] = player;
    }
}