import { Injectable } from '@angular/core';
import { Message, PayloadMessage } from '@common/message.interface';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private socket: Socket;
    private messageSubject: Subject<Message> = new Subject<Message>();
    private initialMessagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

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

    getMessage(): Observable<Message> {
        return this.messageSubject.asObservable();
    }

    getInitialMessages(): Observable<Message[]> {
        return this.initialMessagesSubject.asObservable();
    }

    getMessages(roomId: string): void {
        this.socket.emit('get_messages', roomId);
    }

    private connect() {
        this.socket = io(environment.wsUrl, { transports: ['websocket'] });
        this.listenForMessage();
        this.listenForInitialMessages();
    }

    private listenForMessage() {
        this.socket.on('receive_message', (message: Message) => {
            this.messageSubject.next(message);
        });
    }

    private listenForInitialMessages() {
        this.socket.on('receive_messages', (messages: Message[]) => {
            this.initialMessagesSubject.next(messages);
        });
    }
}
