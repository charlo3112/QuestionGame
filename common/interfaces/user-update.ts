export interface UserConnectionUpdate {
    isConnected: boolean;
    username: string;
}

export const USER_CONNECTION_UPDATE: UserConnectionUpdate = {
    isConnected: false,
    username: '',
};
