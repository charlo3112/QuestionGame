import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { WebSocketService } from '@app/services/websocket.service';
import { User } from '@common/user.interface';

@Component({
    selector: 'app-loading-page',
    templateUrl: './loading-page.component.html',
    styleUrls: ['./loading-page.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, MatIconModule, MatButtonModule, MatTooltipModule, ChatComponent, MatToolbarModule, RouterModule, MatListModule],
})
export class LoadingPageComponent implements OnInit {
    players: string[] = [];
    roomLocked = false;
    roomCode: string;
    isHost = false;
    username: string;

    constructor(
        private router: Router,
        private websocketService: WebSocketService,
    ) {}

    async ngOnInit() {
        this.isHost = false;
        const data = sessionStorage.getItem('user');
        if (!data) {
            this.router.navigate(['/']);
        } else {
            const user: User = JSON.parse(data);
            const res = await this.websocketService.rejoinRoom(user);
            if (!res) {
                sessionStorage.removeItem('user');
                this.router.navigate(['/']);
            }
            sessionStorage.setItem('user', JSON.stringify({ ...user, userId: this.websocketService.id }));

            this.players = await this.websocketService.getUsers();
            this.players = this.players.filter((p) => p !== 'Organisateur');

            this.username = user.name;
            this.roomCode = user.roomId;

            if (this.username === 'Organisateur') {
                this.isHost = true;
            }
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
        this.players = this.players.filter((p) => p !== player);
        this.websocketService.banUser(player);
    }
}
