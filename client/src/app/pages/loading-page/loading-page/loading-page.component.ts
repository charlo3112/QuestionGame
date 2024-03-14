import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameService } from '@app/services/game.service';
import { TimeService } from '@app/services/time.service';
import { WebSocketService } from '@app/services/websocket.service';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-loading-page',
    templateUrl: './loading-page.component.html',
    styleUrls: ['./loading-page.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, MatIconModule, MatButtonModule, MatCardModule, MatTooltipModule, ChatComponent, MatToolbarModule, RouterModule],
})
export class LoadingPageComponent implements OnInit, OnDestroy {
    players: Set<string> = new Set();
    roomLocked = false;
    private userSubscription: Subscription;

    constructor(
        private websocketService: WebSocketService,
        private timeService: TimeService,
        readonly gameService: GameService,
    ) {
        this.subscribeToUserUpdate();
        this.gameService.reset();
    }

    get time() {
        return this.timeService.time;
    }

    async ngOnInit() {
        await this.gameService.init();
        (await this.websocketService.getUsers()).forEach((u) => this.players.add(u));
        this.players.delete(this.gameService.usernameValue);
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        this.gameService.leaveRoom();
    }

    onToggleLock() {
        this.roomLocked = !this.roomLocked;
        this.websocketService.toggleClosed(this.roomLocked);
    }

    onStartGame() {
        this.websocketService.launchGame();
    }

    onKickPlayer(player: string) {
        this.players.delete(player);
        this.websocketService.banUser(player);
    }

    private subscribeToUserUpdate() {
        this.userSubscription = this.websocketService.getUserUpdate().subscribe({
            next: (userUpdate: UserConnectionUpdate) => {
                if (userUpdate.isConnected) {
                    this.players.add(userUpdate.username);
                } else {
                    this.players.delete(userUpdate.username);
                }
            },
        });
    }
}
