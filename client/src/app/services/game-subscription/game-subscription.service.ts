import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SortOption } from '@app/enums/sort-option';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME, SNACKBAR_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Subscription } from 'rxjs';

@Injectable()
export class GameSubscriptionService implements OnDestroy {
    serverTime: number;
    showBonus: boolean;
    scoreValue: number = 0;
    players: Set<string> = new Set();
    histogramData: HistogramData;
    usersStat: UserStat[] = [];
    question: Question | undefined = undefined;
    choicesSelected: boolean[] = [false, false, false, false];
    title: string;
    sortOption: SortOption = SortOption.UsernameAscending;
    private currentState: GameState = GameState.NotStarted;
    private stateSubscription: Subscription;
    private messagesSubscription: Subscription;
    private timeSubscription: Subscription;
    private scoreSubscription: Subscription;
    private userSubscription: Subscription;
    private usersStatSubscription: Subscription;
    private histogramDataSubscription: Subscription;
    private alertSubscription: Subscription;

    // disable lint to make sure have access to all required properties
    // eslint-disable-next-line max-params
    constructor(
        private readonly websocketService: WebSocketService,
        private readonly sessionStorageService: SessionStorageService,
        private readonly snackBarService: MatSnackBar,
        private readonly routerService: Router,
    ) {
        this.subscribeToStateUpdate();
        this.subscribeToClosedConnection();
        this.subscribeToTimeUpdate();
        this.subscribeToScoreUpdate();
        this.subscribeToUserUpdate();
        this.subscribeToUsersStatUpdate();
        this.subscribeToHistogramData();
        this.subscribeToAlert();
    }

    get state(): GameState {
        return this.currentState;
    }

    set state(state: GameStatePayload | GameState) {
        let newState: GameStatePayload = { state: GameState.NotStarted };
        if (typeof state === 'number') {
            newState.state = state;
        } else {
            newState = state;
        }
        this.currentState = newState.state;
        this.question = undefined;
        if (this.currentState === GameState.NotStarted) {
            this.reset();
            return;
        }
        if (this.currentState === GameState.Wait) {
            if (this.routerService.url !== '/loading') {
                this.routerService.navigate(['/loading']);
            }
            return;
        }
        if (this.currentState === GameState.ShowFinalResults) {
            if (this.routerService.url !== '/results') {
                this.routerService.navigate(['/results']);
            }
            return;
        }
        if (this.currentState === GameState.AskingQuestion) {
            this.question = newState.payload as Question;
            this.choicesSelected = [false, false, false, false];
        }
        if (this.currentState === GameState.ShowResults) {
            this.question = newState.payload as Question;
        }
        if (this.currentState === GameState.Starting) {
            this.title = newState.payload as string;
        }
        if (this.routerService.url !== '/game') {
            this.routerService.navigate(['/game']);
        }
    }

    ngOnDestroy() {
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
        }
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
        if (this.timeSubscription) {
            this.timeSubscription.unsubscribe();
        }
        if (this.scoreSubscription) {
            this.scoreSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.usersStatSubscription) {
            this.usersStatSubscription.unsubscribe();
        }
        if (this.histogramDataSubscription) {
            this.histogramDataSubscription.unsubscribe();
        }
        if (this.alertSubscription) {
            this.alertSubscription.unsubscribe();
        }
    }

    async initSubscriptions(state: GameStatePayload) {
        const score = await this.websocketService.getScore();
        this.scoreValue = score.score;
        this.showBonus = score.bonus;
        this.players.clear();
        (await this.websocketService.getUsers()).forEach((u) => this.players.add(u));
        this.players.delete(HOST_NAME);
        this.state = state;
    }

    reset() {
        this.question = undefined;
        this.currentState = GameState.NotStarted;
        this.scoreValue = 0;
        this.choicesSelected = [false, false, false, false];
    }

    sortUsers(): void {
        this.usersStat.sort((a, b) => {
            switch (this.sortOption) {
                case SortOption.UsernameAscending:
                    return a.username.localeCompare(b.username);
                case SortOption.UsernameDescending:
                    return b.username.localeCompare(a.username);
                case SortOption.ScoreAscending:
                    return a.score - b.score;
                case SortOption.ScoreDescending:
                    return b.score - a.score;
                case SortOption.StateAscending:
                    return a.state - b.state;
                case SortOption.StateDescending:
                    return b.state - a.state;
                default:
                    return 0;
            }
        });
    }

    private subscribeToTimeUpdate() {
        this.timeSubscription = this.websocketService.getTime().subscribe({
            next: (time: number) => {
                this.serverTime = time;
            },
        });
    }

    private subscribeToClosedConnection() {
        this.messagesSubscription = this.websocketService.getClosedConnection().subscribe({
            next: (message: string) => {
                this.snackBarService.open(message, undefined, { duration: SNACKBAR_DURATION });
                if (this.sessionStorageService.test || this.routerService.url === '/new') {
                    this.routerService.navigate(['/new']);
                } else {
                    this.routerService.navigate(['/']);
                }
            },
        });
    }

    private subscribeToStateUpdate() {
        this.stateSubscription = this.websocketService.getState().subscribe({
            next: (state: GameStatePayload) => {
                this.state = state;
            },
        });
    }

    private subscribeToScoreUpdate() {
        this.scoreSubscription = this.websocketService.getScoreUpdate().subscribe({
            next: (score: Score) => {
                this.scoreValue = score.score;
                this.showBonus = score.bonus;
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

    private subscribeToUsersStatUpdate() {
        this.usersStatSubscription = this.websocketService.getUsersStat().subscribe({
            next: (usersStat: UserStat[]) => {
                this.usersStat = usersStat;
                this.sortUsers();
            },
        });
    }

    private subscribeToHistogramData() {
        this.histogramDataSubscription = this.websocketService.getHistogramData().subscribe({
            next: (histogramData: HistogramData) => {
                this.histogramData = histogramData;
            },
        });
    }

    private subscribeToAlert() {
        this.alertSubscription = this.websocketService.getAlert().subscribe({
            next: (message: string) => {
                this.snackBarService.open(message, undefined, { duration: SNACKBAR_DURATION });
            },
        });
    }
}
