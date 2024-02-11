import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Choice } from '@app/classes/choice';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
})
export class AnswersComponent {
    @Input() choices: Choice[] = [];

    constructor(private readonly gameService: GameService) {}

    getAnswerClass() {
        return `answers-${this.choices.length}`;
    }

    questionSelected(index: number) {
        this.gameService.selectChoice(index);
    }

    isChoiceCorrect(index: number): boolean | undefined {
        return this.gameService.isChoiceCorrect(index);
    }

    isChoiceIncorrect(index: number): boolean | undefined {
        return this.gameService.isChoiceIncorrect(index);
    }
}
