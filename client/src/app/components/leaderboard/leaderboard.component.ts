import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { GameService } from '@app/services/game/game.service';
import { UserState } from '@common/enums/user-state';
import { UserStat } from '@common/interfaces/user-stat';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule, MatButtonModule],
    standalone: true,
})
export class LeaderboardComponent implements OnInit, OnDestroy {
    usersStat: UserStat[] = [];
    private usersStatSubscription: Subscription;

    constructor(
        readonly gameService: GameService,
        readonly gameSubscriptionService: GameSubscriptionService,
    ) {}

    ngOnInit(): void {
        this.orderPlayers();
        this.subscribeToUsersStatUpdate();
    }

    ngOnDestroy(): void {
        if (this.usersStatSubscription) {
            this.usersStatSubscription.unsubscribe();
        }
    }

    getClassState(state: UserState): string {
        switch (state) {
            case UserState.NoInteraction:
                return 'no-interaction';
            case UserState.FirstInteraction:
                return 'first-interaction';
            case UserState.AnswerConfirmed:
                return 'answer-confirmed';
            case UserState.Disconnect:
                return 'disconnect';
            default:
                return '';
        }
    }

    orderPlayers(): void {
        this.gameService.orderPlayers();
    }

    private subscribeToUsersStatUpdate() {
        this.usersStatSubscription = this.gameSubscriptionService.usersStatSubject.subscribe((usersStat: UserStat[]) => {
            this.usersStat = usersStat;
            this.gameService.orderPlayers();
        });
    }
}
