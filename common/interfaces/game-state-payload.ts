import { GameState } from '../enums/game-state';
import { Game } from './game';
import { Question } from './question';

export type Payload = Game | boolean[] | Question;

export interface GameStatePayload {
    state: GameState;
    payload?: Payload;
}
