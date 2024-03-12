import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '@app/services/game.service';
import { Choice } from '@common/interfaces/choice';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
})
export class AnswersComponent {
    @Input() choices: Choice[] = [];

    constructor(readonly gameService: GameService) {}

    getAnswerClass() {
        return `answers-${this.choices.length}`;
    }
}
