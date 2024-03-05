import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { WebSocketService } from '@app/services/websocket.service';
import { DAY_IN_MS, MAX_MESSAGE_LENGTH } from '@common/constants';
import { Message } from '@common/message.interface';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        AnswersComponent,
        MatButtonModule,
        MatToolbarModule,
    ],
})
export class ChatComponent implements OnDestroy, OnInit {
    @Output() isChatFocused = new EventEmitter<boolean>();
    @Input() username: string;
    chat: Message[] = [];
    chatInput: string = '';
    maxLength = MAX_MESSAGE_LENGTH;
    private messagesSubscription: Subscription;

    constructor(private webSocketService: WebSocketService) {
        this.subscribeToRealTimeMessages();
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        const key = event.key;
        if (key === 'Enter') {
            this.chatSubmit();
        }
    }

    async ngOnInit() {
        this.chat = await this.webSocketService.getMessages();
        this.sortMessages();
    }

    chatSubmit() {
        if (this.chatInput.trim()) {
            this.webSocketService.sendMessage(this.chatInput);
            this.chatInput = '';
        }
    }

    ngOnDestroy() {
        this.webSocketService.leaveRoom();
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
    }
    onFocus() {
        this.isChatFocused.emit(true);
    }

    onFocusOut() {
        this.isChatFocused.emit(false);
    }

    calculateTime(lastModification: number): string {
        const lastModificationDate = new Date(lastModification);
        const now = new Date();
        const timeDiff = now.getTime() - lastModificationDate.getTime();
        const day = DAY_IN_MS;
        if (timeDiff < day) {
            const hours = lastModificationDate.getHours().toString().padStart(2, '0');
            const minutes = lastModificationDate.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } else {
            const year = lastModificationDate.getFullYear();
            const month = (lastModificationDate.getMonth() + 1).toString().padStart(2, '0');
            const dayOfMonth = lastModificationDate.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${dayOfMonth}`;
        }
    }

    private subscribeToRealTimeMessages() {
        this.messagesSubscription = this.webSocketService.getMessage().subscribe({
            next: (message: Message) => {
                this.chat.push(message);
                this.sortMessages();
            },
            // error: (err) => console.error(err),
            // complete: () => console.log('Real-time message stream completed'),
        });
    }

    private sortMessages() {
        this.chat = this.chat
            .sort((a, b) => {
                return a.timestamp - b.timestamp;
            })
            .reverse();
    }
}
