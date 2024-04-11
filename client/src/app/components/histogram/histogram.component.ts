import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { Choice } from '@common/interfaces/choice';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
    imports: [AppMaterialModule, CommonModule],
    standalone: true,
})
export class HistogramComponent {
    @Input() showArrows: boolean = true;
    indexQuestionDisplayed: number = 0;

    constructor(readonly gameService: GameService) {}

    get indexQuestion(): number {
        if (this.showArrows) {
            return this.indexQuestionDisplayed;
        }
        return this.gameService.histogram.indexCurrentQuestion;
    }

    previousQuestion() {
        if (this.indexQuestionDisplayed !== 0) {
            this.indexQuestionDisplayed--;
        } else {
            this.indexQuestionDisplayed = this.gameService.histogram.question.length - 1;
        }
    }

    nextQuestion() {
        if (this.indexQuestionDisplayed !== this.gameService.histogram.question.length - 1) {
            this.indexQuestionDisplayed++;
        } else {
            this.indexQuestionDisplayed = 0;
        }
    }

    getMaxCounter(): number {
        let max = 0;
        for (let i = 0; i < this.gameService.histogram.question[this.indexQuestion].choices.length; i++) {
            if (this.gameService.histogram.choicesCounters[this.indexQuestion][i] > max) {
                max = this.gameService.histogram.choicesCounters[this.indexQuestion][i];
            }
        }
        return max;
    }

    getChoiceIndex(choice: Choice): number {
        return this.gameService.histogram.question[this.indexQuestion].choices.indexOf(choice);
    }
    getCounter(choice: Choice): number {
        return this.gameService.histogram.choicesCounters[this.indexQuestion][this.getChoiceIndex(choice)];
    }
}
