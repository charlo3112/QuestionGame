import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PlayerQRLComponent } from '@app/components/player-qrl/player-qrl.component';
import { TextAnswerComponent } from '@app/components/text-answer/text-answer.component';
import { AppMaterialModule } from '@app/modules/material.module';
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
    imports: [CommonModule, TextAnswerComponent, RouterLink, ChatComponent, AnswersComponent, FormsModule, PlayerQRLComponent, AppMaterialModule],
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
        return this.gameService.currentState === GameState.LAST_QUESTION && this.gameService.isHost && this.gameService.isTest;
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

    canValidate(): boolean {
        return this.gameService.currentState === GameState.ASKING_QUESTION && !this.gameService.isValidationDisabled;
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LAST_QUESTION && this.gameService.isTest) {
            this.router.navigate(['/new']);
        }
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }

    onAnswerChange() {
        this.gameService.sendActivityUpdate();
        this.gameService.sendQrlAnswer(this.gameSubscriptionService.answer);
        this.gameService.qrlAnswer = this.gameSubscriptionService.answer;
    }
}
