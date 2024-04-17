export interface Message {
    name: string;
    message: string;
    timestamp: number;
}

export interface PayloadMessage {
    name: string;
    message: string;
    roomId: string;
}
