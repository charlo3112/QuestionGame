import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { AdminGameViewComponent } from '@app/components/admin-game-view/admin-game-view.component';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { CountdownComponent } from '@app/components/countdown/countdown.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameService } from '@app/services/game.service';
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
        RouterLink,
        CountdownComponent,
    ],
})
export class GamePageComponent implements OnInit, OnDestroy {
    countdownReachedZeroCount: number = 0;
    showButton: boolean = false;
    constructor(
        readonly gameService: GameService,
        public dialog: MatDialog,
        public router: Router,
    ) {}
    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    isStartingGame(): boolean {
        return this.gameService.currentState === GameState.Starting;
    }

    nextQuestion(): void {
        this.gameService.nextQuestion();
    }

    showResults(): void {
        this.gameService.showResults();
    }

    async ngOnInit(): Promise<void> {
        await this.gameService.init();
        this.gameService.timerSubscribe().subscribe((time: number) => {
            if (time === 0) {
                this.countdownReachedZero();
            }
        });
    }

    ngOnDestroy() {
        this.gameService.leaveRoom();
    }

    countdownReachedZero(): void {
        this.countdownReachedZeroCount++;
        if (this.countdownReachedZeroCount % 2 === 1 && this.countdownReachedZeroCount !== 1) {
            this.showButton = true;
        } else {
            this.showButton = false;
        }
    }

    openAbandonDialog(): void {
        const dialogRef = this.dialog.open(AbandonDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.router.navigate(['/new']);
            }
        });
    }
}
