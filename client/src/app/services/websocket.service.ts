import { Injectable } from '@angular/core';
import { GameState } from '@common/game-state';
import { Message } from '@common/message.interface';
import { PayloadJoinGame } from '@common/payload-game.interface';
import { Result } from '@common/result';
import { UserConnectionUpdate } from '@common/user-update.interface';
import { User } from '@common/user.interface';
import { Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: Socket;
    private messageSubject: Subject<Message> = new Subject<Message>();
    private stateSubject: Subject<GameState> = new Subject<GameState>();
    private closedSubject: Subject<string> = new Subject<string>();
    private userUpdateSubject: Subject<UserConnectionUpdate> = new Subject<UserConnectionUpdate>();

    constructor() {
        this.connect();
    }

    get id(): string {
        return this.socket.id;
    }

    sendMessage(message: string): void {
        this.socket.emit('message:send', message);
    }

    async createRoom(gameId: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit('game:create', gameId, (user: User) => {
                resolve(user);
            });
        });
    }

    leaveRoom(): void {
        this.socket.emit('game:leave');
    }

    async joinRoom(gameCode: string, username: string): Promise<Result<GameState>> {
        const payloadJoin: PayloadJoinGame = { gameCode, username };
        return new Promise<Result<GameState>>((resolve) => {
            this.socket.emit('game:join', payloadJoin, (res: Result<GameState>) => {
                resolve(res);
            });
        });
    }

    async rejoinRoom(user: User): Promise<Result<GameState>> {
        return new Promise<Result<GameState>>((resolve) => {
            this.socket.emit('game:rejoin', user, (data: Result<GameState>) => {
                resolve(data);
            });
        });
    }

    toggleClosed(closed: boolean): void {
        this.socket.emit('game:toggle', closed);
    }

    launchGame(): void {
        this.socket.emit('game:launch');
    }

    banUser(userId: string): void {
        this.socket.emit('game:ban', userId);
    }

    getMessage(): Observable<Message> {
        return this.messageSubject.asObservable();
    }

    getClosedConnection(): Observable<string> {
        return this.closedSubject.asObservable();
    }

    getUserUpdate(): Observable<UserConnectionUpdate> {
        return this.userUpdateSubject.asObservable();
    }

    getState(): Observable<GameState> {
        return this.stateSubject.asObservable();
    }

    async getUsers(): Promise<string[]> {
        return new Promise<string[]>((resolve) => {
            this.socket.emit('game:users', (users: string[]) => {
                resolve(users);
            });
        });
    }

    async getMessages(): Promise<Message[]> {
        return new Promise<Message[]>((resolve) => {
            this.socket.emit('messages:get', (messages: Message[]) => {
                resolve(messages);
            });
        });
    }

    private createSocket(): Socket {
        return io(environment.wsUrl, { transports: ['websocket'] });
    }

    private connect() {
        this.socket = this.createSocket();
        this.listenForMessage();
        this.listenForState();
        this.listenForClosedConnection();
        this.listenForUserUpdate();
    }

    private listenForClosedConnection() {
        this.socket.on('game:closed', (message: string) => {
            this.closedSubject.next(message);
        });
    }

    private listenForMessage() {
        this.socket.on('message:receive', (message: Message) => {
            this.messageSubject.next(message);
        });
    }

    private listenForState() {
        this.socket.on('game:state', (state: GameState) => {
            this.stateSubject.next(state);
        });
    }

    private listenForUserUpdate() {
        this.socket.on('game:user-update', (update: UserConnectionUpdate) => {
            this.userUpdateSubject.next(update);
        });
    }
}
