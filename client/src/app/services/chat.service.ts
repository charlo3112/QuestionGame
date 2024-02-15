import { Injectable } from '@angular/core';
import { Message, PayloadMessage } from '@common/message.interface';
import { Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private socket: Socket;
    private messageSubject: Subject<Message> = new Subject<Message>();

    constructor() {
        this.connect();
    }

    sendMessage(message: string, name: string, roomId: string): void {
        const payload: PayloadMessage = { roomId, message, name };
        this.socket.emit('send_message', payload);
    }

    joinRoom(roomId: string): void {
        this.socket.emit('join_room', roomId);
    }

    leaveRoom(roomId: string): void {
        this.socket.emit('leave_room', roomId);
    }

    getMessages(): Observable<Message> {
        return this.messageSubject.asObservable();
    }

    private connect() {
        this.socket = io(environment.wsUrl, { transports: ['websocket'] });
        this.listenForMessages();
    }

    private listenForMessages() {
        this.socket.on('receive_message', (message: Message) => {
            this.messageSubject.next(message);
        });
    }
}
