import { Game } from '@app/model/database/game';
import { Player } from '@app/model/database/player';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateActiveGameDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    game: Game;

    @ApiProperty({ required: true })
    playersHashMap: { [key: number]: Player };
}
