import { UserState } from '../enums/user-state';

export interface UserStat {
    username: string;
    score: number;
    bonus: number;
    state: UserState;
    canChat: boolean;
}

export const USERS: UserStat[] = [
    { username: 'Guilhem', score: 100, bonus: 1, state: UserState.NoInteraction, canChat: true },
    { username: 'Charlo', score: 190, bonus: 0, state: UserState.FirstInteraction, canChat: true },
    { username: 'Gaetan', score: 100, bonus: 2, state: UserState.Disconnect, canChat: false },
];
