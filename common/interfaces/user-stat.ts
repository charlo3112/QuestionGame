import { UserState } from '../enums/user-state';

export interface UserStat {
    username: string;
    score: number;
    bonus: number;
    state: UserState;
    canChat: boolean;
    isActive: boolean;
}

export const USERS: UserStat[] = [
    { username: 'Guilhem', score: 100, bonus: 1, state: UserState.NoInteraction, canChat: true, isActive: false },
    { username: 'Charlo', score: 190, bonus: 0, state: UserState.FirstInteraction, canChat: true, isActive: false },
    { username: 'Gaetan', score: 100, bonus: 2, state: UserState.Disconnect, canChat: true, isActive: false },
];
