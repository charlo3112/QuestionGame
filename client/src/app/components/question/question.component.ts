import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameService } from '@app/services/game/game.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { GameState } from '@common/enums/game-state';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, ChatComponent, MatSlideToggleModule, MatIconModule, AnswersComponent, MatButtonModule, MatToolbarModule],
})
export class QuestionComponent {
    @Input() question: Question;
    isChatFocused: boolean = false;

    constructor(
        readonly gameService: GameService,
        private readonly router: Router,
        private readonly sessionStorageService: SessionStorageService,
    ) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.isChatFocused) {
            return;
        }
        const key = event.key;
        if (key === 'Enter') {
            this.gameService.confirmQuestion();
        }
        const value = parseInt(key, 10) - 1;
        if (!isNaN(value) && value < this.question.choices.length && value >= 0) {
            this.gameService.selectChoice(value);
        }
    }

    showButtonResult() {
        return this.gameService.currentState === GameState.LastQuestion && this.gameService.isHost && this.sessionStorageService.test;
    }

    confirmAndDisable(): void {
        if (!this.gameService.isValidationDisabled) {
            this.gameService.confirmQuestion();
        }
    }

    canValidate(): boolean {
        return this.gameService.currentState === GameState.AskingQuestion && !this.gameService.isValidationDisabled;
    }

    nextStep(): void {
        if (this.gameService.currentState === GameState.LastQuestion && this.sessionStorageService.test) {
            this.router.navigate(['/new']);
        }
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }
}
