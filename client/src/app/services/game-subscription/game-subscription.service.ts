import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SortOption } from '@app/enums/sort-option';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME, SNACKBAR_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { UserGameInfo } from '@common/interfaces/user-game-info';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Subscription } from 'rxjs';

@Injectable()
export class GameSubscriptionService implements OnDestroy {
    isTextLocked: boolean = false;
    answer: string = '';
    showBonus: boolean;
    scoreValue: number = 0;
    players: Set<string> = new Set();
    histogramData: HistogramData;
    qrlResultData: Record<number, QrlAnswer[]>;
    usersStat: UserStat[] = [];
    qrlGradedAnswer: QrlAnswer;
    question: Question | undefined = undefined;
    choicesSelected: boolean[] = [false, false, false, false];
    title: string;
    sortOption: SortOption = SortOption.UsernameAscending;
    isValidate: boolean = false;
    state: GameState = GameState.NotStarted;
    private stateSubscription: Subscription;
    private messagesSubscription: Subscription;
    private scoreSubscription: Subscription;
    private userSubscription: Subscription;
    private usersStatSubscription: Subscription;
    private qrlGradedAnswersSubscription: Subscription;
    private histogramDataSubscription: Subscription;
    private alertSubscription: Subscription;
    private userGameInfoSubscription: Subscription;
    private qrlResultDataSubscription: Subscription;

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
        this.subscribeToScoreUpdate();
        this.subscribeToUserUpdate();
        this.subscribeToUsersStatUpdate();
        this.subscribeToHistogramData();
        this.subscribeToAlert();
        this.subscribeToUserGameInfo();
        this.subscribeToQrlGradedAnswer();
        this.subscribeToQrlResultData();
    }

    ngOnDestroy() {
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
        }
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
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
        if (this.qrlGradedAnswersSubscription) {
            this.qrlGradedAnswersSubscription.unsubscribe();
        }
        if (this.histogramDataSubscription) {
            this.histogramDataSubscription.unsubscribe();
        }
        if (this.alertSubscription) {
            this.alertSubscription.unsubscribe();
        }
        if (this.userGameInfoSubscription) {
            this.userGameInfoSubscription.unsubscribe();
        }
        if (this.qrlResultDataSubscription) {
            this.qrlResultDataSubscription.unsubscribe();
        }
    }

    async initSubscriptions(state: GameStatePayload) {
        const score = await this.websocketService.getScore();
        this.scoreValue = score.score;
        this.showBonus = score.bonus;
        this.players.clear();
        (await this.websocketService.getUsers()).forEach((u) => this.players.add(u));
        this.players.delete(HOST_NAME);
        this.setState(state);
    }

    reset() {
        this.question = undefined;
        this.state = GameState.NotStarted;
        this.scoreValue = 0;
        this.choicesSelected = [false, false, false, false];
    }

    sortUsers(): void {
        this.usersStat.sort((a, b) => {
            let result = 0;
            switch (this.sortOption) {
                case SortOption.UsernameAscending:
                    result = a.username.localeCompare(b.username);
                    break;
                case SortOption.UsernameDescending:
                    result = b.username.localeCompare(a.username);
                    break;
                case SortOption.ScoreAscending:
                    result = a.score - b.score;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
                case SortOption.ScoreDescending:
                    result = b.score - a.score;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
                case SortOption.StateAscending:
                    result = a.state - b.state;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
                case SortOption.StateDescending:
                    result = b.state - a.state;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
            }
            return result;
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
                this.setState(state);
                if (this.state === GameState.ShowResults) {
                    this.isTextLocked = false;
                    this.answer = '';
                } else if (this.state === GameState.AskingQuestion && this.qrlGradedAnswer !== undefined) {
                    this.qrlGradedAnswer.grade = Grade.Ungraded;
                }
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

    private subscribeToQrlGradedAnswer() {
        this.qrlGradedAnswersSubscription = this.websocketService.getQrlGradedAnswers().subscribe({
            next: (qrlAnswer: QrlAnswer) => {
                this.qrlGradedAnswer = qrlAnswer;
            },
        });
    }

    private subscribeToQrlResultData() {
        this.qrlResultDataSubscription = this.websocketService.getQrlResultData().subscribe({
            next: (qrlResultData: Record<number, QrlAnswer[]>) => {
                this.qrlResultData = qrlResultData;
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

    private subscribeToUserGameInfo() {
        this.userGameInfoSubscription = this.websocketService.getUserGameInfo().subscribe({
            next: (userGameInfo: UserGameInfo) => {
                this.choicesSelected = userGameInfo.choice;
                this.isValidate = userGameInfo.validate;
            },
        });
    }

    private setState(state: GameStatePayload) {
        this.state = state.state;
        if (this.state === GameState.NotStarted) {
            this.reset();
            return;
        }
        if (this.state === GameState.Wait) {
            this.setRoute('/loading');
            return;
        }
        if (this.state === GameState.ShowFinalResults) {
            this.setRoute('/results');
            return;
        }
        if (this.state === GameState.ShowResults || this.state === GameState.LastQuestion || this.state === GameState.AskingQuestion) {
            this.question = state.payload as Question;
        }
        if (this.state === GameState.Starting) {
            this.title = state.payload as string;
        }
        this.setRoute('/game');
    }

    private setRoute(route: string) {
        if (this.routerService.url !== route) {
            this.routerService.navigate([route]);
        }
    }
}
