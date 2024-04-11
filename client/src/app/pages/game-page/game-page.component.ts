import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { AdminGameViewComponent } from '@app/components/admin-game-view/admin-game-view.component';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { CountdownComponent } from '@app/components/countdown/countdown.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { AppMaterialModule } from '@app/modules/material.module';
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
export class GamePageComponent implements OnInit {
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
        return this.gameService.currentState === GameState.LAST_QUESTION ? 'Résultats' : 'Prochaine Question';
    }

    showButton(): boolean {
        return (
            ((this.gameService.currentState === GameState.SHOW_RESULTS && !this.gameService.isPlaying) ||
                this.gameService.currentState === GameState.LAST_QUESTION) &&
            this.gameService.isHost &&
            (!this.gameService.isPlaying || this.sessionStorageService.test)
        );
    }

    isStartingGame(): boolean {
        return this.gameService.currentState === GameState.STARTING;
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LAST_QUESTION) {
            if (this.sessionStorageService.test) {
                this.router.navigate(['/new']);
                return;
            }
            this.gameService.showFinalResults();
        } else {
            this.gameService.nextQuestion();
        }
    }

    async ngOnInit(): Promise<void> {
        await this.gameService.init();
    }

    openAbandonDialog(): void {
        const dialogRef = this.dialog.open(AbandonDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.gameService.leaveRoom();
            }
        });
    }
}
