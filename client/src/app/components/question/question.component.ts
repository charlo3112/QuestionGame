import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { Question } from '@app/interfaces/question';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from '@app/components/chat/chat.component';
import { RouterLink } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }
}
