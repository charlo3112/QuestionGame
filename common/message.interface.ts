export interface Message {
    name: string;
    message: string;
    timestamp: string;
}

export interface PayloadMessage {
    name: string;
    message: string;
    roomId: string;
}
