import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameService } from '@app/services/game.service';
import { TimeService } from '@app/services/time.service';
import { WebSocketService } from '@app/services/websocket.service';
import { SNACKBAR_DURATION, WAITING_TIME_MS } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Game } from '@common/interfaces/game';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { User } from '@common/interfaces/user';
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
    roomCode: string;
    isHost = false;
    username: string;
    private messagesSubscription: Subscription;
    private userSubscription: Subscription;
    private stateSubscription: Subscription;

    // This is needed because all the services are necessary
    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private websocketService: WebSocketService,
        private snackBar: MatSnackBar,
        private timeService: TimeService,
        private gameService: GameService,
    ) {
        this.subscribeToClosedConnection();
        this.subscribeToUserUpdate();
        this.subscribeToStateUpdate();
    }

    get time() {
        return this.timeService.time;
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
                this.snackBar.open(res.error, undefined, { duration: SNACKBAR_DURATION });
                this.router.navigate(['/']);
                return;
            }
            sessionStorage.setItem('user', JSON.stringify({ ...user, userId: this.websocketService.id }));

            (await this.websocketService.getUsers()).forEach((u) => this.players.add(u));
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
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
        }
    }

    onToggleLock() {
        this.roomLocked = !this.roomLocked;
        this.websocketService.toggleClosed(this.roomLocked);
    }

    onStartGame() {
        this.websocketService.launchGame();
        this.timeService.startTimer(WAITING_TIME_MS);
    }

    onKickPlayer(player: string) {
        this.players.delete(player);
        this.websocketService.banUser(player);
    }

    private subscribeToClosedConnection() {
        this.messagesSubscription = this.websocketService.getClosedConnection().subscribe({
            next: (message: string) => {
                this.snackBar.open(message, undefined, { duration: SNACKBAR_DURATION });
                this.router.navigate(['/']);
            },
        });
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

    private subscribeToStateUpdate() {
        this.stateSubscription = this.websocketService.getState().subscribe((state: GameStatePayload) => {
            if (state.state === GameState.AskingQuestion) {
                this.router.navigate(['/game']);
                this.gameService.startGame(state.payload as Game);
            }
        });
    }
}
