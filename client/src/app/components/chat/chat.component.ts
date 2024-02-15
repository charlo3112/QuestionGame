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

    constructor(private chatService: ChatService) {
        this.subscribeToMessages();
        this.chatService.joinRoom('RoomId');
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
        this.chatService.leaveRoom('RoomId');
    }
    onFocus() {
        this.isChatFocused.emit(true);
    }

    onFocusOut() {
        this.isChatFocused.emit(false);
    }

    private subscribeToMessages() {
        this.messagesSubscription = this.chatService.getMessages().subscribe({
            next: (message: Message) => {
                this.chat.push(message);
            },
            error: (err) => console.error(err),
        });
    }
}
