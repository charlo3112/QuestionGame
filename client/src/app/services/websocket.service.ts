import { Injectable } from '@angular/core';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Message } from '@common/interfaces/message';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { User } from '@common/interfaces/user';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: Socket;
    private messageSubject: Subject<Message> = new Subject<Message>();
    private stateSubject: Subject<GameStatePayload> = new Subject<GameStatePayload>();
    private closedSubject: Subject<string> = new Subject<string>();
    private userUpdateSubject: Subject<UserConnectionUpdate> = new Subject<UserConnectionUpdate>();
    private timeSubject: Subject<number> = new Subject<number>();
    private scoreSubject: Subject<Score> = new Subject<Score>();
    private usersStatSubject: Subject<UserStat[]> = new Subject<UserStat[]>();
    private histogramDataSubject: Subject<HistogramData> = new Subject<HistogramData>();

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

    sendChoice(choice: boolean[]): void {
        this.socket.emit('game:choice', choice);
    }

    validateChoice(): void {
        this.socket.emit('game:validate');
    }

    leaveRoom(): void {
        this.socket.emit('game:leave');
    }

    nextQuestion() {
        this.socket.emit('game:next');
    }

    showFinalResults() {
        this.socket.emit('game:results');
    }

    async isValidate(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.socket.emit('game:isValidate', (isValidate: boolean) => {
                resolve(isValidate);
            });
        });
    }

    async getChoice(): Promise<boolean[]> {
        return new Promise<boolean[]>((resolve) => {
            this.socket.emit('game:getChoice', (choice: boolean[]) => {
                resolve(choice);
            });
        });
    }

    async joinRoom(gameCode: string, username: string): Promise<Result<GameState>> {
        const payloadJoin: PayloadJoinGame = { gameCode, username };
        return new Promise<Result<GameState>>((resolve) => {
            this.socket.emit('game:join', payloadJoin, (res: Result<GameState>) => {
                resolve(res);
            });
        });
    }

    async rejoinRoom(user: User): Promise<Result<GameStatePayload>> {
        return new Promise<Result<GameStatePayload>>((resolve) => {
            this.socket.emit('game:rejoin', user, (data: Result<GameStatePayload>) => {
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

    getState(): Observable<GameStatePayload> {
        return this.stateSubject.asObservable();
    }

    getClosedConnection(): Observable<string> {
        return this.closedSubject.asObservable();
    }

    getScoreUpdate(): Observable<Score> {
        return this.scoreSubject.asObservable();
    }

    getUserUpdate(): Observable<UserConnectionUpdate> {
        return this.userUpdateSubject.asObservable();
    }

    getTime(): Observable<number> {
        return this.timeSubject.asObservable();
    }

    getUsersStat(): Observable<UserStat[]> {
        return this.usersStatSubject.asObservable();
    }

    getChoicesCounter(): Observable<HistogramData> {
        return this.histogramDataSubject.asObservable();
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

    async getScore(): Promise<Score> {
        return new Promise<Score>((resolve) => {
            this.socket.emit('game:score', (score: Score) => {
                resolve(score);
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
        this.listenForTimeUpdate();
        this.listenForScoreUpdate();
        this.listenForUsersStat();
        this.listenForChoicesCounter();
    }

    private listenForClosedConnection() {
        this.socket.on('game:closed', (message: string) => {
            this.closedSubject.next(message);
        });
    }

    private listenForScoreUpdate() {
        this.socket.on('game:score', (score: Score) => {
            this.scoreSubject.next(score);
        });
    }

    private listenForMessage() {
        this.socket.on('message:receive', (message: Message) => {
            this.messageSubject.next(message);
        });
    }

    private listenForState() {
        this.socket.on('game:state', (state: GameStatePayload) => {
            this.stateSubject.next(state);
        });
    }

    private listenForUserUpdate() {
        this.socket.on('game:user-update', (update: UserConnectionUpdate) => {
            this.userUpdateSubject.next(update);
        });
    }

    private listenForTimeUpdate() {
        this.socket.on('game:time', (time: number) => {
            this.timeSubject.next(time);
        });
    }

    private listenForUsersStat() {
        this.socket.on('game:users-stat', (usersStat: UserStat[]) => {
            this.usersStatSubject.next(usersStat);
        });
    }

    private listenForChoicesCounter() {
        this.socket.on('game:choices-counter', (histogramData: HistogramData) => {
            this.histogramDataSubject.next(histogramData);
        });
    }
}
