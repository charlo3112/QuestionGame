import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { AdminGameViewComponent } from '@app/components/admin-game-view/admin-game-view.component';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { CountdownComponent } from '@app/components/countdown/countdown.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameService } from '@app/services/game/game.service';
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
    constructor(
        private readonly dialog: MatDialog,
        readonly gameService: GameService,
    ) {}
    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    isStartingGame(): boolean {
        return this.gameService.currentState === GameState.Starting;
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
