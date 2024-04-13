import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PlayerQRLComponent } from '@app/components/player-qrl/player-qrl.component';
import { TextAnswerComponent } from '@app/components/text-answer/text-answer.component';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        TextAnswerComponent,
        RouterLink,
        ChatComponent,
        MatSlideToggleModule,
        MatIconModule,
        AnswersComponent,
        MatButtonModule,
        MatToolbarModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        PlayerQRLComponent,
    ],
})
export class QuestionComponent implements OnInit {
    @Input() question: Question;
    isChatFocused: boolean = false;
    gameState = GameState;

    constructor(
        readonly gameService: GameService,
        public gameSubscriptionService: GameSubscriptionService,
        private readonly router: Router,
    ) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.isChatFocused) {
            return;
        }
        const key = event.key;
        if (key === 'Enter') {
            this.confirmAndDisable();
        }
        const value = parseInt(key, 10) - 1;
        if (!isNaN(value) && value < this.question.choices.length && value >= 0) {
            this.gameService.selectChoice(value);
        }
    }

    ngOnInit(): void {
        const savedAnswer = this.gameService.qrlAnswer;
        if (savedAnswer) {
            this.gameSubscriptionService.answer = savedAnswer;
        }
    }

    showButtonResult() {
        return this.gameService.currentState === GameState.LastQuestion && this.gameService.isHost && this.gameService.isTest;
    }

    confirmAndDisable(): void {
        if (!this.gameService.isValidationDisabled) {
            this.gameService.confirmQuestion();
            if (this.gameService.currentQuestion?.type === QuestionType.QRL) {
                this.gameService.sendQrlAnswer(this.gameSubscriptionService.answer);
                this.gameSubscriptionService.isTextLocked = true;
            }
        }
    }

    saveAnswer(): void {
        this.gameService.sendQrlAnswer(this.gameSubscriptionService.answer);
        this.gameService.qrlAnswer = this.gameSubscriptionService.answer;
    }

    canValidate(): boolean {
        return this.gameService.currentState === GameState.AskingQuestion && !this.gameService.isValidationDisabled;
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LastQuestion && this.gameService.isTest) {
            this.router.navigate(['/new']);
        }
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }
}
