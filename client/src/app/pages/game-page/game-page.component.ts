import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { AdminGameViewComponent } from '@app/components/admin-game-view/admin-game-view.component';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { CountdownComponent } from '@app/components/countdown/countdown.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameService } from '@app/services/game/game.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [
        AdminGameViewComponent,
        CommonModule,
        QuestionComponent,
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        AnswersComponent,
        MatButtonModule,
        MatToolbarModule,
        MatDividerModule,
        CountdownComponent,
        RouterModule,
    ],
})
export class GamePageComponent implements OnInit, OnDestroy {
    buttonText: string = 'Prochaine Question';

    // eslint-disable-next-line max-params
    constructor(
        private readonly sessionStorageService: SessionStorageService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
        readonly gameService: GameService,
    ) {}
    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    showButton(): boolean {
        return (
            ((this.gameService.currentState === GameState.ShowResults && !this.gameService.isPlaying) ||
                this.gameService.currentState === GameState.LastQuestion) &&
            this.gameService.isHost &&
            (!this.gameService.isPlaying || this.sessionStorageService.test)
        );
    }

    isStartingGame(): boolean {
        return this.gameService.currentState === GameState.Starting;
    }

    nextStep(): void {
        if (this.buttonText === 'Résultats') {
            if (this.sessionStorageService.test) {
                this.router.navigate(['/new']);
                return;
            }
            this.gameService.showFinalResults();
        } else if (this.buttonText === 'Prochaine Question') {
            this.gameService.nextQuestion();
        }
    }

    async ngOnInit(): Promise<void> {
        await this.gameService.init();
        const gameData = this.sessionStorageService.gameData;
        if (gameData === undefined) {
            this.buttonText = 'Prochaine Question';
        } else {
            this.buttonText = gameData;
        }
        this.sessionStorageService.gameData = this.buttonText;
        this.gameService.stateSubscribe().subscribe((statePayload: GameStatePayload) => {
            if (statePayload.state === GameState.LastQuestion) {
                this.buttonText = 'Résultats';
                this.sessionStorageService.gameData = this.buttonText;
            }
        });
    }

    ngOnDestroy(): void {
        this.buttonText = 'Prochaine Question';
    }

    openAbandonDialog(): void {
        const dialogRef = this.dialog.open(AbandonDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.gameService.leaveRoom();
            }
        });
    }
}
