import { CommonModule, NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { Question } from '@app/interfaces/question';
import { TimeService } from '@app/services/time.service';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from '@app/components/chat/chat.component';
import { RouterLink } from '@angular/router';
import { GameService } from '@app/services/game.service';

const timeConfirmMs = 3000;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, NgIf, ChatComponent, MatIconModule, AnswersComponent, MatButtonModule, MatToolbarModule],
})
export class PlayAreaComponent implements AfterViewInit {
    @Input() question: Question;
    chat: string[] = [];
    chatInput: string = '';
    isChatFocused: boolean = false;
    showAnswer: boolean = false;

    readonly timer = 60;
    constructor(
        private readonly timeService: TimeService,
        private readonly gameService: GameService,
    ) {}

    get score(): number {
        return 3;
    }

    get time(): number {
        return this.timeService.time;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.isChatFocused) {
            return;
        }
        const key = event.key;
        if (key === 'Enter') {
            this.confirmQuestion();
        }
        const value = parseInt(key, 10) - 1;
        if (!isNaN(value) && value < this.question.choices.length) {
            this.question.choices[value].isSelected = !this.question.choices[value].isSelected;
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.resetTimer();
        });
    }

    resetTimer() {
        const next = () => {
            this.confirmQuestion();
        };
        this.timeService.startTimer(this.timer, next);
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

    confirmQuestion() {
        if (this.showAnswer === true) return;
        this.timeService.stopTimer();
        this.showAnswer = true;
        this.timeService.setTimeout(() => {
            this.showAnswer = false;
            this.gameService.next();
            if (!this.gameService.getCurrent()) {
                return;
            }
            this.resetTimer();
        }, timeConfirmMs);
    }

    abandonnerPartie() {
        window.alert('Partie abandonnée');
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }
}
