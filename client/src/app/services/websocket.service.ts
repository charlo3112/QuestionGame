import { Injectable } from '@angular/core';
import { Message, PayloadMessage } from '@common/message.interface';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: Socket;
    private messageSubject: Subject<Message> = new Subject<Message>();
    private initialMessagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

    constructor() {
        this.connect();
    }

    sendMessage(message: string, name: string, roomId: string): void {
        const payload: PayloadMessage = { roomId, message, name };
        this.socket.emit('message:send', payload);
    }

    // TODO: join and leave room are temporary, they will be removed when the system of waiting room is implemented
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
        this.socket.emit('messages:get', roomId);
    }

    private createSocket(): Socket {
        return io(environment.wsUrl, { transports: ['websocket'] });
    }

    private connect() {
        this.socket = this.createSocket();
        this.listenForMessage();
        this.listenForInitialMessages();
    }

    private listenForMessage() {
        this.socket.on('message:receive', (message: Message) => {
            this.messageSubject.next(message);
        });
    }

    private listenForInitialMessages() {
        this.socket.on('messages:list', (messages: Message[]) => {
            this.initialMessagesSubject.next(messages);
        });
    }
}
