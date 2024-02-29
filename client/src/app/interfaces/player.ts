export interface Player {
    name: string;
    score: number;
    nbOfBonus: number;
}

export const PLAYERS: Player[] = [
    { name: 'Alice', score: 100, nbOfBonus: 1 },
    { name: 'Bob', score: 80, nbOfBonus: 0 },
    { name: 'Charlie', score: 120, nbOfBonus: 2 },
];
