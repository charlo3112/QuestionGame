import { Question } from '@app/interfaces/question';

export interface Game {
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    questions: Question[];
    image: string;
    isVisible: boolean;
}

export const GAME_PLACEHOLDER: Game = {
    id: 'game_id',
    title: 'Game title',
    description: 'Game description',
    duration: 10,
    lastModification: '01-01-2024',
    questions: [],
    image: 'assets/logo.png',
    isVisible: true,
};
