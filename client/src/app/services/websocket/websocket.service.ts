import { Injectable } from '@angular/core';
import { GameState } from '@common/enums/game-state';
import { WebsocketMessage } from '@common/enums/websocket-message';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Message } from '@common/interfaces/message';
import { PayloadJoinGame } from '@common/interfaces/payload-game';
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
        this.socket.emit(WebsocketMessage.MessageSend, message);
    }

    setChat(username: string, value: boolean): void {
        const payload: SetChatPayload = { username, value };
        this.socket.emit(WebsocketMessage.SetChat, payload);
    }

    async createRoom(gameId: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit(WebsocketMessage.CreateGame, gameId, (user: User) => {
                resolve(user);
            });
        });
    }

    async testGame(gameId: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit(WebsocketMessage.CreateTest, gameId, (user: User) => {
                resolve(user);
            });
        });
    }

    sendChoice(choice: boolean[]): void {
        this.socket.emit(WebsocketMessage.SendChoice, choice);
    }

    validateChoice(): void {
        this.socket.emit(WebsocketMessage.ValidateChoice);
    }

    leaveRoom(): void {
        this.socket.emit(WebsocketMessage.LeaveGame);
    }

    startTest(): void {
        this.socket.emit(WebsocketMessage.StartTest);
    }

    showFinalResults() {
        this.socket.emit(WebsocketMessage.Results);
    }

    async isValidate(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.socket.emit(WebsocketMessage.IsValidate, (isValidate: boolean) => {
                resolve(isValidate);
            });
        });
    }

    async getChoice(): Promise<boolean[]> {
        return new Promise<boolean[]>((resolve) => {
            this.socket.emit(WebsocketMessage.GetChoice, (choice: boolean[]) => {
                resolve(choice);
            });
        });
    }

    async joinRoom(gameCode: string, username: string): Promise<Result<GameState>> {
        const payloadJoin: PayloadJoinGame = { gameCode, username };
        return new Promise<Result<GameState>>((resolve) => {
            this.socket.emit(WebsocketMessage.JoinGame, payloadJoin, (res: Result<GameState>) => {
                resolve(res);
            });
        });
    }

    async startRandom(): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit(WebsocketMessage.CreateGameRandom, (res: User) => {
                resolve(res);
            });
        });
    }

    async rejoinRoom(user: User): Promise<Result<GameStatePayload>> {
        return new Promise<Result<GameStatePayload>>((resolve) => {
            this.socket.emit(WebsocketMessage.Rejoin, user, (data: Result<GameStatePayload>) => {
                resolve(data);
            });
        });
    }

    toggleClosed(closed: boolean): void {
        this.socket.emit(WebsocketMessage.ToggleGame, closed);
    }

    hostConfirm(): void {
        this.socket.emit(WebsocketMessage.Confirm);
    }

    banUser(userId: string): void {
        this.socket.emit(WebsocketMessage.Ban, userId);
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
        this.socket.emit(WebsocketMessage.Panic);
    }

    togglePause(): void {
        this.socket.emit(WebsocketMessage.Pause);
    }

    async getUsers(): Promise<string[]> {
        return new Promise<string[]>((resolve) => {
            this.socket.emit(WebsocketMessage.Users, (users: string[]) => {
                resolve(users);
            });
        });
    }

    async getMessages(): Promise<Message[]> {
        return new Promise<Message[]>((resolve) => {
            this.socket.emit(WebsocketMessage.MessagesGet, (messages: Message[]) => {
                resolve(messages);
            });
        });
    }

    async getScore(): Promise<Score> {
        return new Promise<Score>((resolve) => {
            this.socket.emit(WebsocketMessage.Score, (score: Score) => {
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
        this.listenForHistogramData();
        this.listenForAlert();
        this.listenForUserGameInfo();
    }

    private listenForClosedConnection() {
        this.socket.on(WebsocketMessage.Closed, (message: string) => {
            this.closedSubject.next(message);
        });
    }

    private listenForScoreUpdate() {
        this.socket.on(WebsocketMessage.Score, (score: Score) => {
            this.scoreSubject.next(score);
        });
    }

    private listenForMessage() {
        this.socket.on(WebsocketMessage.MessageReceive, (message: Message) => {
            this.messageSubject.next(message);
        });
    }

    private listenForState() {
        this.socket.on(WebsocketMessage.State, (state: GameStatePayload) => {
            this.stateSubject.next(state);
        });
    }

    private listenForUserUpdate() {
        this.socket.on(WebsocketMessage.UserUpdate, (update: UserConnectionUpdate) => {
            this.userUpdateSubject.next(update);
        });
    }

    private listenForTimeUpdate() {
        this.socket.on(WebsocketMessage.Time, (time: TimeData) => {
            this.timeSubject.next(time);
        });
    }

    private listenForUsersStat() {
        this.socket.on(WebsocketMessage.UsersStat, (usersStat: UserStat[]) => {
            this.usersStatSubject.next(usersStat);
        });
    }

    private listenForHistogramData() {
        this.socket.on(WebsocketMessage.HistogramData, (histogramData: HistogramData) => {
            this.histogramDataSubject.next(histogramData);
        });
    }

    private listenForAlert() {
        this.socket.on(WebsocketMessage.Alert, (message: string) => {
            this.alertSubject.next(message);
        });
    }

    private listenForUserGameInfo() {
        this.socket.on(WebsocketMessage.UserGameInfo, (userGameInfo: UserGameInfo) => {
            this.userGameInfoSubject.next(userGameInfo);
        });
    }
}
