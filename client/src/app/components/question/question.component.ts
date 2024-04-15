import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, ChatComponent, AnswersComponent, FormsModule, AppMaterialModule],
})
export class QuestionComponent implements OnInit {
    @Input() question: Question;
    isChatFocused: boolean = false;

    constructor(
        readonly gameService: GameService,
        private readonly router: Router,
    ) {}

    get text(): string {
        const cent = 100;
        const score = +this.gameService.grade * cent;
        return this.gameService.grade === Grade.Ungraded ? "Réponse est en cours d'évaluation" : `Vous avez obtenu la note de ${score}%`;
    }

    get showText(): boolean {
        return (
            this.question.type === QuestionType.QRL &&
            (this.gameService.currentState === GameState.LAST_QUESTION ||
                this.gameService.currentState === GameState.SHOW_RESULTS ||
                this.gameService.currentState === GameState.WAITING_FOR_ANSWERS)
        );
    }

    get showButtonResult(): boolean {
        return this.gameService.currentState === GameState.LAST_QUESTION && this.gameService.isHost && this.gameService.isTest;
    }

    get canValidate(): boolean {
        return (
            (this.gameService.currentState === GameState.ASKING_QUESTION_QCM || this.gameService.currentState === GameState.ASKING_QUESTION_QRL) &&
            !this.gameService.isValidationDisabled
        );
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent): void {
        if (this.isChatFocused) {
            return;
        }
        const key = event.key;
        if (key === 'Enter') {
            this.confirmAndDisable();
        }
        const value = parseInt(key, 10) - 1;
        if (!isNaN(value) && this.question.type === QuestionType.QCM && value < this.question.choices.length && value >= 0) {
            this.gameService.selectChoice(value);
        }
    }

    ngOnInit(): void {
        const savedAnswer = this.gameService.qrlAnswer;
        if (savedAnswer) {
            this.gameService.qrlAnswer = savedAnswer;
        }
    }

    confirmAndDisable(): void {
        if (!this.gameService.isValidationDisabled) {
            if (this.gameService.currentQuestion?.type === QuestionType.QRL) {
                this.gameService.sendQrlAnswer(this.gameService.qrlAnswer);
            }
            this.gameService.confirmQuestion();
        }
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LAST_QUESTION && this.gameService.isTest) {
            this.router.navigate(['/new']);
        }
    }

    chatFocused(focus: boolean): void {
        this.isChatFocused = focus;
    }

    onAnswerChange(): void {
        this.gameService.sendQrlAnswer(this.gameService.qrlAnswer);
    }
}
