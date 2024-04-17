export interface UserConnectionUpdate {
    isConnected: boolean;
    username: string;
}

export const USER_CONNECTION_UPDATE: UserConnectionUpdate = {
    isConnected: true,
    username: 'test',
};

export const USER_CONNECTION_UPDATE2: UserConnectionUpdate = {
    isConnected: false,
    username: 'test',
};
