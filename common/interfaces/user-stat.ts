import { UserState } from '../enums/user-state';

export interface UserStat {
    username: string;
    score: number;
    bonus: number;
    state: UserState;
}

export const USERS: UserStat[] = [
    { username: 'Guilhem', score: 100, bonus: 1, state: UserState.NoInteraction },
    { username: 'Charlo', score: 190, bonus: 0, state: UserState.FirstInteraction },
    { username: 'Gaetan', score: 100, bonus: 2, state: UserState.Disconnect },
];
