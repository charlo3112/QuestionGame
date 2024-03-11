import { GameState } from '../enums/game-state';
import { Game } from './game';

type Payload = Game | boolean[];

export interface GameStatePayload {
    state: GameState;
    payload?: Payload;
}
