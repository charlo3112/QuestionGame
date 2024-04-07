import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { TextAnswerComponent } from '@app/components/text-answer/text-answer.component';
import { GameService } from '@app/services/game/game.service';
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
    ],
})
export class QuestionComponent {
    @Input() question: Question;
    isChatFocused: boolean = false;
    isTextLocked: boolean = false;
    buttonDisabled: boolean = false;
    changesCounter: number = 0;
    answer: string = '';

    constructor(readonly gameService: GameService) {}

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

    confirmAndDisable(): void {
        if (!this.gameService.isValidationDisabled) {
            this.gameService.confirmQuestion();
            if (this.gameService.currentQuestion?.type === 'QRL') {
                this.gameService.sendQrlAnswer(this.answer);
                this.isTextLocked = true;
            }
        }
    }

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }
}
