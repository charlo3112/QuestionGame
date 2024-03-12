import { GameState } from '../enums/game-state';
import { Game } from './game';

export type Payload = Game | boolean[];

export interface GameStatePayload {
    state: GameState;
    payload?: Payload;
}
