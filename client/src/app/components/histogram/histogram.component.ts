import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { Choice } from '@common/interfaces/choice';
import { Histogram } from '@common/interfaces/histogram-data';
import { Question } from '@common/interfaces/question';

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
        if (this.showArrows || this.gameService.histogram === undefined) {
            return this.indexQuestionDisplayed;
        }
        return Math.min(this.gameService.histogram.indexCurrentQuestion, this.gameService.histogram.question.length - 1);
    }

    get gradeData(): Grade[] {
        return this.histogram?.type === QuestionType.QRL ? this.histogram.grades : [];
    }

    get histogram(): Histogram | undefined {
        return this.gameService.histogram?.histogram[this.indexQuestion];
    }

    get question(): Question | undefined {
        return this.gameService.histogram?.question[this.indexQuestion];
    }

    get maxCounter(): number {
        if (this.question?.type !== QuestionType.QCM || this.histogram?.type !== QuestionType.QCM) return 0;
        let max = 0;
        for (let i = 0; i < this.question.choices.length; i++) {
            if (this.histogram.choicesCounters[i] > max) {
                max = this.histogram.choicesCounters[i];
            }
        }
        return max;
    }

    get zeroGrade(): number {
        return this.gradeData.filter((grade) => grade === Grade.Zero).length;
    }

    get halfGrade(): number {
        return this.gradeData.filter((grade) => grade === Grade.Half).length;
    }

    get perfectGrade(): number {
        return this.gradeData.filter((grade) => grade === Grade.One).length;
    }

    get maxQRL(): number {
        const histogram = this.gameService.histogram?.histogram[this.indexQuestion];
        return histogram?.type === QuestionType.QRL ? Math.max(histogram.active, histogram.inactive) : 0;
    }

    get maxQRLResult(): number {
        return Math.max(this.zeroGrade, this.halfGrade, this.perfectGrade);
    }

    get isFinalQrlResult(): boolean {
        return !(this.gameService.currentQuestion?.type === QuestionType.QRL || this.gameService.currentState !== GameState.SHOW_FINAL_RESULTS);
    }

    previousQuestion(): void {
        if (this.gameService.histogram === undefined) return;
        if (this.indexQuestionDisplayed !== 0) {
            this.indexQuestionDisplayed--;
        } else {
            this.indexQuestionDisplayed = this.gameService.histogram.question.length - 1;
        }
    }

    nextQuestion(): void {
        if (this.gameService.histogram === undefined) return;
        if (this.indexQuestionDisplayed !== this.gameService.histogram.question.length - 1) {
            this.indexQuestionDisplayed++;
        } else {
            this.indexQuestionDisplayed = 0;
        }
    }

    getChoiceIndex(choice: Choice): number {
        return this.question?.type === QuestionType.QCM ? this.question.choices.indexOf(choice) : 0;
    }

    getCounter(choice: Choice): number {
        return this.histogram?.type === QuestionType.QCM ? this.histogram.choicesCounters[this.getChoiceIndex(choice)] : 0;
    }
}
