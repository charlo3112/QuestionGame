import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Result } from '@common/interfaces/result';
import { User } from '@common/interfaces/user';

@Injectable()
export class SessionStorageService {
    constructor(
        private readonly routerService: Router,
        private readonly websocketService: WebSocketService,
        private readonly snackBarService: MatSnackBar,
    ) {}

    get test(): boolean {
        return sessionStorage.getItem('test') === 'true' ? true : false;
    }

    get user(): User | undefined {
        const data = sessionStorage.getItem('user');
        if (!data) {
            this.routerService.navigate(['/']);
            return undefined;
        }
        return JSON.parse(data);
    }

    get username(): string {
        return this.user?.name || '';
    }

    get roomId(): string {
        return this.user?.roomId || '';
    }

    get play(): boolean {
        return this.user?.play || false;
    }

    get login(): boolean {
        return JSON.parse(sessionStorage.getItem('login') || 'false');
    }

    set login(login: boolean) {
        sessionStorage.setItem('login', login ? 'true' : 'false');
    }

    set test(test: boolean) {
        sessionStorage.setItem('test', test ? 'true' : 'false');
    }
    set user(user: User | undefined) {
        if (!user) {
            return;
        }
        sessionStorage.setItem('user', JSON.stringify(user));
    }

    async initUser(): Promise<Result<GameStatePayload>> {
        if (!this.user) {
            return { ok: false, error: 'No user found' };
        }
        const res = await this.websocketService.rejoinRoom(this.user);
        if (!res.ok) {
            sessionStorage.removeItem('user');
            this.snackBarService.open(res.error, undefined, { duration: SNACKBAR_DURATION });
            if (this.test) {
                this.routerService.navigate(['/new']);
            } else {
                this.routerService.navigate(['/']);
            }
            return res;
        }

        this.user = { ...this.user, userId: this.websocketService.id };
        return res;
    }

    removeUser(): void {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('test');
    }
}
