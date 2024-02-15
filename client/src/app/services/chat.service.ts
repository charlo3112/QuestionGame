import { Injectable } from '@angular/core';
import { Message } from '@common/message.interface';
import { Observable, Subject } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private chatSubject: WebSocketSubject<Message>;
    private messages: Subject<Message> = new Subject<Message>();

    constructor() {
        this.connect();
    }

    sendMessage(message: string, name: string, roomId: string): void {
        const payload = { roomId, message, name };
        this.chatSubject.next(payload);
    }

    getMessages(): Observable<Message> {
        return this.messages.asObservable();
    }

    private connect(): void {
        this.chatSubject = webSocket(environment.wsUrl);
        this.chatSubject.subscribe({
            next: (msg) => this.messages.next(msg),
            error: (err) => console.log(err),
            complete: () => console.log('Connection Closed'),
        });
    }
}
