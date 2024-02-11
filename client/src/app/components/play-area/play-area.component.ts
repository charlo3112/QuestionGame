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

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, ChatComponent, MatIconModule, AnswersComponent, MatButtonModule, MatToolbarModule],
})
export class PlayAreaComponent {
    @Input() question: Question;
    isChatFocused: boolean = false;

    readonly timer = 60;
    constructor(private readonly gameService: GameService) {}

    get score(): number {
        return 3;
    }

    get time(): number {
        return this.gameService.time;
    }

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
        if (!isNaN(value) && value < this.question.choices.length) {
            this.gameService.selectChoice(value);
        }
    }

    questionVerification() {
        let numCorrect = 0;
        let selectedCorrect = 0;
        for (const choice of this.question.choices) {
            if (choice.isCorrect) {
                numCorrect++;
            }
            if (choice.isSelected && choice.isCorrect) {
                selectedCorrect++;
            }
        }
        return numCorrect === selectedCorrect;
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }

    confirmQuestion() {
        this.gameService.confirmQuestion();
    }
}
