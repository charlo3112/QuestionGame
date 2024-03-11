import { QUESTIONS_PLACEHOLDER, Question } from './question';

export interface Game {
    gameId: string;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    questions: Question[];
    image: string;
    visibility: boolean;
}

export const GAME_PLACEHOLDER: Game = {
    gameId: 'game_id',
    title: 'Game title',
    description: 'Game description',
    duration: 10,
    lastModification: '01-01-2024',
    questions: QUESTIONS_PLACEHOLDER,
    image: 'assets/logo.png',
    visibility: true,
};
