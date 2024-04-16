import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { AdminGameViewComponent } from '@app/components/admin-game-view/admin-game-view.component';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { CountdownComponent } from '@app/components/countdown/countdown.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { TIME_CHECK_FIREWORK } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { Question } from '@common/interfaces/question';
import { Subscription, interval } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [
        AppMaterialModule,
        AdminGameViewComponent,
        CommonModule,
        QuestionComponent,
        FormsModule,
        AnswersComponent,
        CountdownComponent,
        RouterModule,
    ],
})
export class GamePageComponent implements OnInit, OnDestroy {
    qrlCorrected: boolean = false;
    firework: boolean = false;
    private body: HTMLElement = document.querySelector('body') as HTMLElement;
    private bodyBackground: string = this.body.style.backgroundColor;
    private intervalSubscription: Subscription = new Subscription();
    constructor(
        private readonly dialog: MatDialog,
        readonly gameService: GameService,
    ) {}
    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    isStartingGame(): boolean {
        return this.gameService.currentState === GameState.STARTING;
    }

    async ngOnInit(): Promise<void> {
        await this.gameService.init();
        this.intervalSubscription = interval(TIME_CHECK_FIREWORK).subscribe(() => {
            this.launchFireworks();
        });
    }

    ngOnDestroy(): void {
        this.intervalSubscription.unsubscribe();
        this.body.style.backgroundColor = this.bodyBackground;
    }

    openAbandonDialog(): void {
        const dialogRef = this.dialog.open(AbandonDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.gameService.leaveRoom();
            }
        });
    }

    launchFireworks(): void {
        if (this.gameService.firework) {
            this.body.style.backgroundColor = 'black';
            this.firework = true;
        } else {
            this.body.style.backgroundColor = this.bodyBackground;
            this.firework = false;
        }
    }
}
