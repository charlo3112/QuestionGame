import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { MAX_MESSAGE_LENGTH } from '@common/constants';
import { Message } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, CommonModule, FormsModule, AnswersComponent],
})
export class ChatComponent implements OnDestroy, OnInit {
    @Output() isChatFocused = new EventEmitter<boolean>();
    chat: Message[] = [];
    chatInput: string = '';
    maxLength = MAX_MESSAGE_LENGTH;
    private messagesSubscription: Subscription;

    constructor(
        private readonly webSocketService: WebSocketService,
        readonly gameService: GameService,
    ) {
        this.subscribeToRealTimeMessages();
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent): void {
        const key = event.key;
        if (key === 'Enter') {
            this.chatSubmit();
        }
    }

    async ngOnInit(): Promise<void> {
        this.chat = await this.webSocketService.getMessages();
        this.sortMessages();
    }

    chatSubmit(): void {
        if (this.chatInput.trim()) {
            this.webSocketService.sendMessage(this.chatInput);
            this.chatInput = '';
        }
    }

    ngOnDestroy(): void {
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
    }

    onFocus(): void {
        this.isChatFocused.emit(true);
    }

    onFocusOut(): void {
        this.isChatFocused.emit(false);
    }

    calculateTime(lastModification: number): string {
        const lastModificationDate = new Date(lastModification);
        const hours = lastModificationDate.getHours().toString().padStart(2, '0');
        const minutes = lastModificationDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    private subscribeToRealTimeMessages(): void {
        this.messagesSubscription = this.webSocketService.getMessage().subscribe({
            next: (message: Message) => {
                this.chat.push(message);
                this.sortMessages();
            },
        });
    }

    private sortMessages(): void {
        this.chat = this.chat.sort((a, b) => {
            return b.timestamp - a.timestamp;
        });
    }
}
