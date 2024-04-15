import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AdminQrlComponent } from '@app/components/admin-qrl/admin-qrl.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.html',
    styleUrls: ['./admin-game-view.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, LeaderboardComponent, HistogramComponent, ChatComponent, CommonModule, AdminQrlComponent],
})
export class AdminGameViewComponent implements OnInit {
    @Output() answersCorrected: EventEmitter<void> = new EventEmitter<void>();
    currentQuestion: Question;
    readyForGrading: boolean = false;
    gradesSent: boolean = false;

    constructor(readonly gameService: GameService) {}

    get buttonText(): string {
        return this.gameService.currentState === GameState.LAST_QUESTION ? 'Résultats' : 'Prochaine Question';
    }

    get showPanel(): boolean {
        return this.gameService.currentState !== GameState.WAITING_FOR_ANSWERS;
    }

    get showCorrectAnswers(): boolean {
        return this.gameService.currentState === GameState.WAITING_FOR_ANSWERS;
    }

    get enableNextStepButton(): boolean {
        return this.gameService.currentState === GameState.SHOW_RESULTS || this.gameService.currentState === GameState.LAST_QUESTION;
    }

    get canPause(): boolean {
        return this.gameService.currentState === GameState.ASKING_QUESTION_QCM || this.gameService.currentState === GameState.ASKING_QUESTION_QRL;
    }

    get canPanic(): boolean {
        return (
            !this.gameService.panic &&
            (this.gameService.currentState === GameState.ASKING_QUESTION_QCM || this.gameService.currentState === GameState.ASKING_QUESTION_QRL) &&
            ((this.gameService.currentQuestion?.type === QuestionType.QCM && this.gameService.time > MIN_TIME_PANIC_QCM_S) ||
                (this.gameService.currentQuestion?.type === QuestionType.QRL && this.gameService.time > MIN_TIME_PANIC_QRL_S))
        );
    }

    nextStep(): void {
        this.gradesSent = false;
        if (this.gameService.currentState === GameState.LAST_QUESTION) {
            this.gameService.showFinalResults();
        } else {
            this.gameService.nextQuestion();
        }
    }

    togglePause(): void {
        this.gameService.togglePause();
    }

    startPanicking(): void {
        if (!this.canPanic) {
            return;
        }
        this.gameService.startPanic();
    }

    ngOnInit(): void {
        if (this.gameService.currentQuestion) {
            this.currentQuestion = this.gameService.currentQuestion;
        }
    }

    qrlCorrected(): void {
        this.answersCorrected.emit();
    }
}
