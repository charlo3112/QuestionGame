import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatService } from '@app/services/chat.service';
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
export class ChatComponent implements OnDestroy {
    @Output() isChatFocused = new EventEmitter<boolean>();
    chat: Message[] = [];
    chatInput: string = '';
    private messagesSubscription: Subscription;
    private initialMessagesSubscription: Subscription;

    constructor(private chatService: ChatService) {
        this.subscribeToInitialMessages();
        this.subscribeToRealTimeMessages();
        this.chatService.joinRoom('RoomId');
        this.chatService.getMessages('RoomId');
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        const key = event.key;
        if (key === 'Enter') {
            this.chatSubmit();
        }
    }

    chatSubmit() {
        if (this.chatInput.trim()) {
            this.chatService.sendMessage(this.chatInput, 'YourMum', 'RoomId');
            this.chatInput = '';
        }
    }

    ngOnDestroy() {
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
        if (this.initialMessagesSubscription) {
            this.initialMessagesSubscription.unsubscribe();
        }
        this.chatService.leaveRoom('RoomId');
    }
    onFocus() {
        this.isChatFocused.emit(true);
    }

    onFocusOut() {
        this.isChatFocused.emit(false);
    }

    private subscribeToInitialMessages() {
        this.initialMessagesSubscription = this.chatService.getInitialMessages().subscribe({
            next: (messages: Message[]) => {
                this.chat = messages;
            },
            error: (err) => console.error(err),
            complete: () => console.log('Initial message stream completed'),
        });
    }

    private subscribeToRealTimeMessages() {
        this.messagesSubscription = this.chatService.getMessage().subscribe({
            next: (message: Message) => {
                this.chat.push(message);
            },
            error: (err) => console.error(err),
            complete: () => console.log('Real-time message stream completed'),
        });
        this.sortMessagesByTimestamp();
    }

    private sortMessagesByTimestamp() {
        this.chat.sort((a, b) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
    }
}
