import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';

@Component({
    selector: 'app-loading-page',
    templateUrl: './loading-page.component.html',
    styleUrls: ['./loading-page.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, MatIconModule, MatButtonModule, MatCardModule, MatTooltipModule, ChatComponent, MatToolbarModule, RouterModule],
})
export class LoadingPageComponent implements OnInit, OnDestroy {
    roomLocked = false;

    constructor(
        private readonly websocketService: WebSocketService,
        readonly gameService: GameService,
    ) {
        this.gameService.reset();
    }

    async ngOnInit() {
        await this.gameService.init();
    }

    ngOnDestroy() {
        this.gameService.leaveRoom();
    }

    onToggleLock() {
        this.roomLocked = !this.roomLocked;
        this.websocketService.toggleClosed(this.roomLocked);
    }

    onStartGame() {
        this.websocketService.hostConfirm();
    }
}
