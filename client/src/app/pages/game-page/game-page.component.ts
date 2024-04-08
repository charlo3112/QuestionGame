import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class GamePageComponent implements OnInit {
    qrlCorrected: boolean = false;
    alreadyClicked: boolean = false;
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

    get buttonText(): string {
        return this.gameService.currentState === GameState.LastQuestion ? 'Résultats' : 'Prochaine Question';
    }

    showButton(): boolean {
        const isResultsShownAndNotPlaying = this.gameService.currentState === GameState.ShowResults && !this.gameService.isPlaying;
        const isLastQuestion = this.gameService.currentState === GameState.LastQuestion;
        const isHost = this.gameService.isHost;
        const isNotPlayingOrTestSession = !this.gameService.isPlaying || this.sessionStorageService.test;
        if (this.buttonText === 'Résultats') {
            return isHost;
        } else if (this.alreadyClicked) {
            return false;
        } else if (this.question?.type === 'QRL') {
            if (this.qrlCorrected) {
                return (isResultsShownAndNotPlaying || isLastQuestion) && isHost && isNotPlayingOrTestSession;
            } else {
                return false;
            }
        }
        return (isResultsShownAndNotPlaying || isLastQuestion) && isHost && isNotPlayingOrTestSession;
    }

    isStartingGame(): boolean {
        return this.gameService.currentState === GameState.Starting;
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LastQuestion) {
            if (this.sessionStorageService.test) {
                this.router.navigate(['/new']);
                return;
            }
            this.gameService.showFinalResults();
        } else if (this.buttonText === 'Prochaine Question') {
            this.alreadyClicked = false;
            this.gameService.nextQuestion();
        }
    }

    async ngOnInit(): Promise<void> {
        await this.gameService.init();
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
