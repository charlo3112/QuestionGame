import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { WebSocketService } from '@app/services/websocket.service';
import { UserConnectionUpdate } from '@common/user-update.interface';
import { User } from '@common/user.interface';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-loading-page',
    templateUrl: './loading-page.component.html',
    styleUrls: ['./loading-page.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, MatIconModule, MatButtonModule, MatTooltipModule, ChatComponent, MatToolbarModule, RouterModule, MatListModule],
})
export class LoadingPageComponent implements OnInit, OnDestroy {
    players: Set<string> = new Set();
    roomLocked = false;
    roomCode: string;
    isHost = false;
    username: string;
    private messagesSubscription: Subscription;

    constructor(
        private router: Router,
        private websocketService: WebSocketService,
        private snackBar: MatSnackBar,
    ) {
        this.subscribeToClosedConnection();
        this.subscribeToUserUpdate();
    }

    async ngOnInit() {
        this.isHost = false;
        const data = sessionStorage.getItem('user');
        if (!data) {
            this.router.navigate(['/']);
        } else {
            const user: User = JSON.parse(data);
            const res = await this.websocketService.rejoinRoom(user);
            if (!res.ok) {
                sessionStorage.removeItem('user');
                this.snackBar.open(res.error, undefined, { duration: 2000 });
                this.router.navigate(['/']);
            }
            sessionStorage.setItem('user', JSON.stringify({ ...user, userId: this.websocketService.id }));

            await (await this.websocketService.getUsers()).forEach((u) => this.players.add(u));
            this.players.delete(user.name);

            this.username = user.name;
            this.roomCode = user.roomId;

            if (this.username === 'Organisateur') {
                this.isHost = true;
            }
        }
    }

    ngOnDestroy() {
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
    }

    onToggleLock() {
        this.roomLocked = !this.roomLocked;
        this.websocketService.toggleClosed(this.roomLocked);
    }

    onStartGame() {
        window.alert('Game started!');
        // TODO: Add logic to actually start game with right players
    }

    onKickPlayer(player: string) {
        this.players.delete(player);
        this.websocketService.banUser(player);
    }

    private subscribeToClosedConnection() {
        this.messagesSubscription = this.websocketService.getClosedConnection().subscribe({
            next: (message: string) => {
                this.snackBar.open(message, undefined, { duration: 2000 });
                this.router.navigate(['/']);
            },
        });
    }

    private subscribeToUserUpdate() {
        this.messagesSubscription = this.websocketService.getUserUpdate().subscribe({
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
