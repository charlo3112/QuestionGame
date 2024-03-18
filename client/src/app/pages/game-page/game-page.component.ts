import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AdminGameViewComponent } from '@app/components/admin-game-view/admin-game-view.component';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { CountdownComponent } from '@app/components/countdown/countdown.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameService } from '@app/services/game.service';
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
        RouterLink,
        CountdownComponent,
    ],
})
export class GamePageComponent implements OnInit, OnDestroy {
    countdownReachedZeroCount: number = 0;
    showButton: boolean = false;
    buttonText: string = 'Prochaine Question';
    constructor(readonly gameService: GameService) {}
    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    isStartingGame(): boolean {
        return this.gameService.currentState === GameState.Starting;
    }

    nextStep(): void {
        if (this.buttonText === 'Résultats') {
            this.gameService.showFinalResults();
        } else if (this.buttonText === 'Prochaine Question') this.gameService.nextQuestion();
    }

    async ngOnInit(): Promise<void> {
        await this.gameService.init();
        this.gameService.timerSubscribe().subscribe((time: number) => {
            if (time === 0) {
                this.countdownReachedZero();
            }
        });
        this.gameService.stateSubscribe().subscribe((statePayload: GameStatePayload) => {
            if (statePayload.state === GameState.LastQuestion) {
                this.buttonText = 'Résultats';
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
}
