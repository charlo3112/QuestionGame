import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { TextAnswerComponent } from '@app/components/text-answer/text-answer.component';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
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
    ],
})
export class QuestionComponent implements OnChanges, OnInit {
    @Input() question: Question;
    isChatFocused: boolean = false;
    buttonDisabled: boolean = false;
    changesCounter: number = 0;

    constructor(readonly gameService: GameService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.isChatFocused) {
            return;
        }
        const key = event.key;
        if (key === 'Enter') {
            this.gameService.confirmQuestion();
            this.disableButton();
        }
        const value = parseInt(key, 10) - 1;
        if (!isNaN(value) && value < this.question.choices.length && value >= 0) {
            this.gameService.selectChoice(value);
        }
    }

    confirmAndDisable(): void {
        if (!this.buttonDisabled) {
            this.gameService.confirmQuestion();
            this.disableButton();
        }
    }

    disableButton(): void {
        const button = document.getElementById('confirm-button') as HTMLButtonElement;
        if (button) {
            button.disabled = true;
            this.buttonDisabled = true;
        }
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }

    resetButton(): void {
        const button = document.getElementById('confirm-button') as HTMLButtonElement;
        if (button) {
            button.disabled = false;
            this.buttonDisabled = false;
        }
    }

    ngOnInit(): void {
        this.gameService.stateSubscribe().subscribe((statePayload: GameStatePayload) => {
            if (statePayload.state === GameState.LastQuestion) {
                const button = document.getElementById('confirm-button') as HTMLButtonElement;
                if (button) {
                    button.disabled = true;
                    this.buttonDisabled = true;
                }
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question && this.changesCounter === 2) {
            this.changesCounter = 0;
            this.resetButton();
        }

        this.changesCounter++;
    }
}
