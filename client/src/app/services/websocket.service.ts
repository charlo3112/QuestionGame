import { Injectable } from '@angular/core';
import { GameState } from '@common/game-state';
import { Message, PayloadMessage } from '@common/message.interface';
import { PayloadJoinGame } from '@common/payload-game.interface';
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
    private stateSubject: Subject<GameState> = new Subject<GameState>();

    constructor() {
        this.connect();
    }

    sendMessage(message: string, name: string, roomId: string): void {
        const payload: PayloadMessage = { roomId, message, name };
        this.socket.emit('message:send', payload);
    }

    createRoom(gameId: string): void {
        this.socket.emit('game:create', gameId);
    }

    leaveRoom(): void {
        this.socket.emit('game:leave');
    }

    joinRoom(gameCode: string, username: string): void {
        const payloadJoin: PayloadJoinGame = { gameCode, username };
        this.socket.emit('game:join', payloadJoin);
    }

    toggleClosed(closed: boolean): void {
        this.socket.emit('game:toggle', closed);
    }

    launchGame(): void {
        this.socket.emit('game:launch');
    }

    leaveUser(userId: string): void {
        this.socket.emit('game:leave', userId);
    }

    banUser(userId: string): void {
        this.socket.emit('game:ban', userId);
    }

    getMessage(): Observable<Message> {
        return this.messageSubject.asObservable();
    }

    getInitialMessages(): Observable<Message[]> {
        return this.initialMessagesSubject.asObservable();
    }

    getState(): Observable<GameState> {
        return this.stateSubject.asObservable();
    }

    getMessages(roomId: string): void {
        this.socket.emit('messages:get', roomId);
    }

    private createSocket(): Socket {
        return io(environment.serverUrl, { transports: ['websocket'] });
    }

    private connect() {
        this.socket = this.createSocket();
        this.listenForMessage();
        this.listenForInitialMessages();
        this.listenForState();
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

    private listenForState() {
        this.socket.on('game:state', (state: GameState) => {
            this.stateSubject.next(state);
        });
    }
}
