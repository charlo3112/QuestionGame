export interface Player {
    name: string;
    score: number;
    nbOfBonus: number;
}

export const PLAYERS: Player[] = [
    { name: 'Guilhem', score: 100, nbOfBonus: 1 },
    { name: 'Charlo', score: 190, nbOfBonus: 0 },
    { name: 'Gaetan', score: 100, nbOfBonus: 2 },
];
