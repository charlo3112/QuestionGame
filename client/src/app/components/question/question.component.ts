import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, CommonModule, RouterLink, ChatComponent, AnswersComponent],
})
export class QuestionComponent {
    @Input() question: Question;
    isChatFocused: boolean = false;

    constructor(readonly gameService: GameService) {}

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

    confirmAndDisable(): void {
        if (!this.gameService.isValidationDisabled) {
            this.gameService.confirmQuestion();
        }
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }
}
