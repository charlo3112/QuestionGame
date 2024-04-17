import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { HOST_NAME, SNACKBAR_DURATION } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { SortOption } from '@common/enums/sort-option';
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
    answer: string = '';
    showBonus: boolean;
    scoreValue: number = 0;
    users: Set<string> = new Set();
    histogramData: HistogramData | undefined = undefined;
    usersStat: UserStat[] = [];
    qrlGradedAnswer: Grade = Grade.Ungraded;
    question: Question | undefined = undefined;
    choicesSelected: boolean[] = [false, false, false, false];
    title: string;
    sortOption: SortOption = SortOption.USERNAME_ASCENDING;
    isValidate: boolean = false;
    state: GameState = GameState.NOT_STARTED;
    qrlAnswers: QrlAnswer[] = [];
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
    private qrlAnswerSubscription: Subscription;
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
        this.subscribeToQrlGradedAnswer();
        this.subscribeToQrlResultData();
        this.subscribeToQrlAnswer();
    }

    ngOnDestroy(): void {
        const subscriptionsToUnsubscribe = [
            this.stateSubscription,
            this.messagesSubscription,
            this.scoreSubscription,
            this.userSubscription,
            this.usersStatSubscription,
            this.histogramDataSubscription,
            this.alertSubscription,
            this.userGameInfoSubscription,
            this.qrlGradedAnswersSubscription,
            this.qrlResultDataSubscription,
            this.qrlAnswerSubscription,
        ];
        subscriptionsToUnsubscribe.forEach((subscription) => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    }

    async initSubscriptions(state: GameStatePayload): Promise<void> {
        const score = await this.websocketService.getScore();
        this.scoreValue = score.score;
        this.showBonus = score.bonus;
        this.users.clear();
        (await this.websocketService.getUsers()).forEach((u) => this.users.add(u));
        this.users.delete(HOST_NAME);
        this.setState(state);
    }

    reset(): void {
        this.question = undefined;
        this.state = GameState.NOT_STARTED;
        this.scoreValue = 0;
        this.choicesSelected = [false, false, false, false];
    }

    sortUsers(): void {
        this.usersStat.sort((a, b) => {
            let result = 0;
            switch (this.sortOption) {
                case SortOption.USERNAME_ASCENDING:
                    result = a.username.localeCompare(b.username);
                    break;
                case SortOption.USERNAME_DESCENDING:
                    result = b.username.localeCompare(a.username);
                    break;
                case SortOption.SCORE_ASCENDING:
                    result = a.score - b.score;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
                case SortOption.SCORE_DESCENDING:
                    result = b.score - a.score;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
                case SortOption.STATE_ASCENDING:
                    result = a.state - b.state;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
                case SortOption.STATE_DESCENDING:
                    result = b.state - a.state;
                    if (result === 0) {
                        result = a.username.localeCompare(b.username);
                    }
                    break;
            }
            return result;
        });
    }

    private subscribeToClosedConnection(): void {
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

    private subscribeToStateUpdate(): void {
        this.stateSubscription = this.websocketService.getState().subscribe({
            next: (state: GameStatePayload) => {
                this.setState(state);
            },
        });
    }

    private subscribeToScoreUpdate(): void {
        this.scoreSubscription = this.websocketService.getScoreUpdate().subscribe({
            next: (score: Score) => {
                this.scoreValue = score.score;
                this.showBonus = score.bonus;
            },
        });
    }

    private subscribeToUserUpdate(): void {
        this.userSubscription = this.websocketService.getUserUpdate().subscribe({
            next: (userUpdate: UserConnectionUpdate) => {
                if (userUpdate.isConnected) {
                    this.users.add(userUpdate.username);
                } else {
                    this.users.delete(userUpdate.username);
                }
            },
        });
    }

    private subscribeToUsersStatUpdate(): void {
        this.usersStatSubscription = this.websocketService.getUsersStat().subscribe({
            next: (usersStat: UserStat[]) => {
                this.usersStat = usersStat;
                this.sortUsers();
            },
        });
    }

    private subscribeToQrlGradedAnswer(): void {
        this.qrlGradedAnswersSubscription = this.websocketService.getQrlGradedAnswers().subscribe({
            next: (qrlAnswer: Grade) => {
                this.qrlGradedAnswer = qrlAnswer;
            },
        });
    }

    private subscribeToHistogramData(): void {
        this.histogramDataSubscription = this.websocketService.getHistogramData().subscribe({
            next: (histogramData: HistogramData) => {
                this.histogramData = histogramData;
            },
        });
    }

    private subscribeToAlert(): void {
        this.alertSubscription = this.websocketService.getAlert().subscribe({
            next: (message: string) => {
                this.snackBarService.open(message, undefined, { duration: SNACKBAR_DURATION });
            },
        });
    }

    private subscribeToUserGameInfo(): void {
        this.userGameInfoSubscription = this.websocketService.getUserGameInfo().subscribe({
            next: (userGameInfo: UserGameInfo) => {
                this.choicesSelected = userGameInfo.choice;
                this.isValidate = userGameInfo.validate;
            },
        });
    }

    private subscribeToQrlResultData(): void {
        this.qrlResultDataSubscription = this.websocketService.getQrlResultData().subscribe({
            next: (qrlResultData: QrlAnswer[]) => {
                this.qrlAnswers = qrlResultData;
            },
        });
    }

    private subscribeToQrlAnswer(): void {
        this.qrlAnswerSubscription = this.websocketService.getQrlAnswer().subscribe({
            next: (answer: string) => {
                this.answer = answer;
            },
        });
    }

    private setState(state: GameStatePayload): void {
        this.state = state.state;

        switch (this.state) {
            case GameState.WAIT:
                this.setRoute('/loading');
                break;
            case GameState.SHOW_FINAL_RESULTS:
                this.setRoute('/results');
                break;
            case GameState.SHOW_RESULTS:
            case GameState.LAST_QUESTION:
            case GameState.ASKING_QUESTION_QCM:
            case GameState.ASKING_QUESTION_QRL:
            case GameState.WAITING_FOR_ANSWERS:
                this.question = state.payload as Question;
                this.setRoute('/game');
                break;
            case GameState.STARTING:
                this.title = state.payload as string;
                this.setRoute('/game');
                break;
            case GameState.NOT_STARTED:
            default:
                this.reset();
                this.setRoute('/');
                break;
        }
    }

    private setRoute(route: string): void {
        if (this.routerService.url !== route) {
            this.routerService.navigate([route]);
        }
    }
}
