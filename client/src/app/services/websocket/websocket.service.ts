import { Injectable } from '@angular/core';
import { GameState } from '@common/enums/game-state';
import { WebsocketMessage } from '@common/enums/websocket-message';
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
    private qrlGradedAnswersSubject: Subject<QrlAnswer> = new Subject<QrlAnswer>();
    private timeSubject: Subject<TimeData> = new Subject<TimeData>();
    private scoreSubject: Subject<Score> = new Subject<Score>();
    private usersStatSubject: Subject<UserStat[]> = new Subject<UserStat[]>();
    private histogramDataSubject: Subject<HistogramData> = new Subject<HistogramData>();
    private alertSubject: Subject<string> = new Subject<string>();
    private userGameInfoSubject: Subject<UserGameInfo> = new Subject<UserGameInfo>();
    private qrlResultDataSubject: Subject<Record<number, QrlAnswer[]>> = new Subject<Record<number, QrlAnswer[]>>();

    constructor() {
        this.connect();
    }

    get id(): string {
        return this.socket.id;
    }

    sendMessage(message: string): void {
        this.socket.emit(WebsocketMessage.MESSAGE_SEND, message);
    }

    setChat(username: string, value: boolean): void {
        const payload: SetChatPayload = { username, value };
        this.socket.emit(WebsocketMessage.SET_CHAT, payload);
    }

    async createRoom(gameId: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit(WebsocketMessage.CREATE_GAME, gameId, (user: User) => {
                resolve(user);
            });
        });
    }

    async testGame(gameId: string): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit(WebsocketMessage.CREATE_TEST, gameId, (user: User) => {
                resolve(user);
            });
        });
    }

    sendChoice(choice: boolean[]): void {
        this.socket.emit(WebsocketMessage.SEND_CHOICE, choice);
    }

    sendAnswers(answers: QrlAnswer[]) {
        this.socket.emit(WebsocketMessage.QRL_ANSWERS, answers);
    }

    sendActivityUpdate(): void {
        this.socket.emit('game:activity-update');
    }

    validateChoice(): void {
        this.socket.emit(WebsocketMessage.VALIDATE_CHOICE);
    }

    sendQrlAnswer(answer: QrlAnswer): void {
        this.socket.emit(WebsocketMessage.QRL_ANSWER, answer);
    }

    leaveRoom(): void {
        this.socket.emit(WebsocketMessage.LEAVE_GAME);
    }

    startTest(): void {
        this.socket.emit(WebsocketMessage.START_TEST);
    }

    showFinalResults() {
        this.socket.emit(WebsocketMessage.RESULTS);
    }

    async isValidate(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.socket.emit(WebsocketMessage.IS_VALIDATE, (isValidate: boolean) => {
                resolve(isValidate);
            });
        });
    }

    async getChoice(): Promise<boolean[]> {
        return new Promise<boolean[]>((resolve) => {
            this.socket.emit(WebsocketMessage.GET_CHOICE, (choice: boolean[]) => {
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
            this.socket.emit(WebsocketMessage.JOIN_GAME, payloadJoin, (res: Result<GameState>) => {
                resolve(res);
            });
        });
    }

    async startRandom(): Promise<User> {
        return new Promise<User>((resolve) => {
            this.socket.emit(WebsocketMessage.CREATE_GAME_RANDOM, (res: User) => {
                resolve(res);
            });
        });
    }

    async rejoinRoom(user: User): Promise<Result<GameStatePayload>> {
        return new Promise<Result<GameStatePayload>>((resolve) => {
            this.socket.emit(WebsocketMessage.REJOIN, user, (data: Result<GameStatePayload>) => {
                resolve(data);
            });
        });
    }

    toggleClosed(closed: boolean): void {
        this.socket.emit(WebsocketMessage.TOGGLE_GAME, closed);
    }

    hostConfirm(): void {
        this.socket.emit(WebsocketMessage.CONFIRM);
    }

    banUser(userId: string): void {
        this.socket.emit(WebsocketMessage.BAN, userId);
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

    getQrlGradedAnswers(): Observable<QrlAnswer> {
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

    getQrlResultData(): Observable<Record<number, QrlAnswer[]>> {
        return this.qrlResultDataSubject.asObservable();
    }

    getAlert(): Observable<string> {
        return this.alertSubject.asObservable();
    }

    getUserGameInfo(): Observable<UserGameInfo> {
        return this.userGameInfoSubject.asObservable();
    }

    startPanicking(): void {
        this.socket.emit(WebsocketMessage.PANIC);
    }

    togglePause(): void {
        this.socket.emit(WebsocketMessage.PAUSE);
    }

    async getUsers(): Promise<string[]> {
        return new Promise<string[]>((resolve) => {
            this.socket.emit(WebsocketMessage.USERS, (users: string[]) => {
                resolve(users);
            });
        });
    }

    async getMessages(): Promise<Message[]> {
        return new Promise<Message[]>((resolve) => {
            this.socket.emit(WebsocketMessage.MESSAGES_GET, (messages: Message[]) => {
                resolve(messages);
            });
        });
    }

    async getScore(): Promise<Score> {
        return new Promise<Score>((resolve) => {
            this.socket.emit(WebsocketMessage.SCORE, (score: Score) => {
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
        this.listenForQrlGradedAnswer();
        this.listenForQrlResultData();
    }

    private listenForClosedConnection() {
        this.socket.on(WebsocketMessage.CLOSED, (message: string) => {
            this.closedSubject.next(message);
        });
    }

    private listenForScoreUpdate() {
        this.socket.on(WebsocketMessage.SCORE, (score: Score) => {
            this.scoreSubject.next(score);
        });
    }

    private listenForMessage() {
        this.socket.on(WebsocketMessage.MESSAGE_RECEIVED, (message: Message) => {
            this.messageSubject.next(message);
        });
    }

    private listenForState() {
        this.socket.on(WebsocketMessage.STATE, (state: GameStatePayload) => {
            this.stateSubject.next(state);
        });
    }

    private listenForUserUpdate() {
        this.socket.on(WebsocketMessage.USER_UPDATE, (update: UserConnectionUpdate) => {
            this.userUpdateSubject.next(update);
        });
    }

    private listenForTimeUpdate() {
        this.socket.on(WebsocketMessage.TIME, (time: TimeData) => {
            this.timeSubject.next(time);
        });
    }

    private listenForUsersStat() {
        this.socket.on(WebsocketMessage.USER_STAT, (usersStat: UserStat[]) => {
            this.usersStatSubject.next(usersStat);
        });
    }

    private listenForQrlGradedAnswer() {
        this.socket.on('game:qrl-graded-answer', (qrlAnswer: QrlAnswer) => {
            this.qrlGradedAnswersSubject.next(qrlAnswer);
        });
    }

    private listenForHistogramData() {
        this.socket.on(WebsocketMessage.HISTOGRAM_DATA, (histogramData: HistogramData) => {
            this.histogramDataSubject.next(histogramData);
        });
    }

    private listenForQrlResultData() {
        this.socket.on(WebsocketMessage.QRL_RESULT_DATA, (qrlResultData: Record<number, QrlAnswer[]>) => {
            this.qrlResultDataSubject.next(qrlResultData);
        });
    }

    private listenForAlert() {
        this.socket.on(WebsocketMessage.ALERT, (message: string) => {
            this.alertSubject.next(message);
        });
    }

    private listenForUserGameInfo() {
        this.socket.on(WebsocketMessage.USER_GAME_INFO, (userGameInfo: UserGameInfo) => {
            this.userGameInfoSubject.next(userGameInfo);
        });
    }
}
