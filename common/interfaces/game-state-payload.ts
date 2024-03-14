import { GameState } from '../enums/game-state';
import { Question } from './question';

export type Payload = boolean[] | Question | string;

export interface GameStatePayload {
    state: GameState;
    payload?: Payload;
}
