import { Injectable } from '@angular/core';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Message } from '@common/interfaces/message';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Result } from '@common/interfaces/result';
import { Score } from '@common/interfaces/score';
import { SetChatPayload } from '@common/interfaces/set-chat-payload';
import { TimeData } from '@common/interfaces/time-data';
import { User } from '@common/interfaces/user';
import { UserGameInfo } from '@common/interfaces/user-game-info';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
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
    private qrlGradedAnswersSubject: Subject<QrlAnswer[]> = new Subject<QrlAnswer[]>();
    private timeSubject: Subject<TimeData> = new Subject<TimeData>();
    private scoreSubject: Subject<Score> = new Subject<Score>();
    private usersStatSubject: Subject<UserStat[]> = new Subject<UserStat[]>();
    private histogramDataSubject: Subject<HistogramData> = new Subject<HistogramData>();
    private alertSubject: Subject<string> = new Subject<string>();
    private userGameInfoSubject: Subject<UserGameInfo> = new Subject<UserGameInfo>();

    constructor() {
        this.connect();
    }

    get id(): string {
        return this.socket.id;
    }

    sendMessage(message: string): void {
        this.socket.emit('message:send', message);
    }

    setChat(username: string, value: boolean): void {
        const payload: SetChatPayload = { username, value };
        this.socket.emit('game:set-chat', payload);
    }

    async createRoom(gameId: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit('game:create', gameId, (user: User) => {
                resolve(user);
            });
        });
    }

    async testGame(gameId: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit('game:test', gameId, (user: User) => {
                resolve(user);
            });
        });
    }

    sendChoice(choice: boolean[]): void {
        this.socket.emit('game:choice', choice);
    }

    sendAnswers(answers: QrlAnswer[]) {
        this.socket.emit('game:qrl-answers', answers);
    }

    validateChoice(): void {
        this.socket.emit('game:validate');
    }

    sendQrlAnswer(answer: QrlAnswer): void {
        this.socket.emit('game:qrl-answer', answer);
    }

    leaveRoom(): void {
        this.socket.emit('game:leave');
    }

    startTest(): void {
        this.socket.emit('game:start-test');
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

    async getQrlAnswers(): Promise<QrlAnswer[]> {
        return new Promise<QrlAnswer[]>((resolve) => {
            this.socket.emit('game:getQrlAnswers', (answers: QrlAnswer[]) => {
                resolve(answers);
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

    async startRandom(): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit('game:create-random', (res: User) => {
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

    hostConfirm(): void {
        this.socket.emit('game:confirm');
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

    getQrlGradedAnswers(): Observable<QrlAnswer[]> {
        return this.qrlGradedAnswersSubject.asObservable();
    }

    getTime(): Observable<TimeData> {
        return this.timeSubject.asObservable();
    }

    getUsersStat(): Observable<UserStat[]> {
        return this.usersStatSubject.asObservable();
    }

    getHistogramData(): Observable<HistogramData> {
        return this.histogramDataSubject.asObservable();
    }

    getAlert(): Observable<string> {
        return this.alertSubject.asObservable();
    }

    getUserGameInfo(): Observable<UserGameInfo> {
        return this.userGameInfoSubject.asObservable();
    }

    startPanicking(): void {
        this.socket.emit('game:panic');
    }

    togglePause(): void {
        this.socket.emit('game:pause');
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
        this.listenForMessage(); // 0
        this.listenForState(); // 1
        this.listenForClosedConnection(); // 2
        this.listenForUserUpdate(); // 3
        this.listenForTimeUpdate(); // 4
        this.listenForScoreUpdate(); // 5
        this.listenForUsersStat(); // 6
        this.listenForHistogramData(); // 7
        this.listenForAlert(); // 8
        this.listenForUserGameInfo(); // 9
        this.listenForQrlGradedAnswers(); // 10
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
        this.socket.on('game:time', (time: TimeData) => {
            this.timeSubject.next(time);
        });
    }

    private listenForUsersStat() {
        this.socket.on('game:users-stat', (usersStat: UserStat[]) => {
            this.usersStatSubject.next(usersStat);
        });
    }

    private listenForQrlGradedAnswers() {
        this.socket.on('game:qrl-graded-answers', (qrlAnswers: QrlAnswer[]) => {
            this.qrlGradedAnswersSubject.next(qrlAnswers);
        });
    }

    private listenForHistogramData() {
        this.socket.on('game:histogramData', (histogramData: HistogramData) => {
            this.histogramDataSubject.next(histogramData);
        });
    }

    private listenForAlert() {
        this.socket.on('game:alert', (message: string) => {
            this.alertSubject.next(message);
        });
    }

    private listenForUserGameInfo() {
        this.socket.on('game:user-game-info', (userGameInfo: UserGameInfo) => {
            this.userGameInfoSubject.next(userGameInfo);
        });
    }
}
