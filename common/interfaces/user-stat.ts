export interface UserStat {
    username: string;
    score: number;
    bonus: number;
    isConnected: boolean;
}

export const USERS: UserStat[] = [
    { username: 'Guilhem', score: 100, bonus: 1, isConnected: true },
    { username: 'Charlo', score: 190, bonus: 0, isConnected: false },
    { username: 'Gaetan', score: 100, bonus: 2, isConnected: true },
];
