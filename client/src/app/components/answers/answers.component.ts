import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { Choice } from '@common/interfaces/choice';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.scss'],
    standalone: true,
    imports: [CommonModule, AppMaterialModule],
})
export class AnswersComponent {
    @Input() choices: Choice[] = [];

    constructor(readonly gameService: GameService) {}

    getAnswerClass() {
        return `answers-${this.choices.length}`;
    }
}
