export interface User {
    userId: string;
    roomId: string;
    name: string;
    play: boolean;
}

export const USER: User = {
    userId: '',
    roomId: '',
    name: '',
    play: false,
};
