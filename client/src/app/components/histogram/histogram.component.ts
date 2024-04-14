import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
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
    questionType = QuestionType;

    constructor(readonly gameService: GameService) {}

    get indexQuestion(): number {
        if (this.showArrows) {
            return this.indexQuestionDisplayed;
        }
        return Math.min(this.gameService.histogram.indexCurrentQuestion, this.gameService.histogram.question.length - 1);
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
    getActive(): number {
        return this.gameService.usersStat.filter((user) => user.isActive).length;
    }
    getInactive(): number {
        return this.gameService.usersStat.filter((user) => !user.isActive).length;
    }
    getMaxQRL(): number {
        return Math.max(this.getActive(), this.getInactive());
    }

    getZeroGrade(): number {
        if (!this.isFinalQrlResult()) {
            return 0;
        } else {
            if (this.gameService.qrlResultData[this.indexQuestionDisplayed] !== undefined) {
                return this.gameService.qrlResultData[this.indexQuestionDisplayed].filter((answer) => answer.grade === Grade.Zero).length;
            }
            return 0;
        }
    }
    getHalfGrade(): number {
        if (!this.isFinalQrlResult()) {
            return 0;
        } else {
            if (this.gameService.qrlResultData[this.indexQuestionDisplayed]) {
                return this.gameService.qrlResultData[this.indexQuestionDisplayed].filter((answer) => answer.grade === Grade.Half).length;
            }

            return 0;
        }
    }
    getPerfectGrade(): number {
        if (!this.isFinalQrlResult()) {
            return 0;
        } else {
            if (this.gameService.qrlResultData[this.indexQuestionDisplayed]) {
                return this.gameService.qrlResultData[this.indexQuestionDisplayed].filter((answer) => answer.grade === Grade.One).length;
            }

            return 0;
        }
    }
    getMaxQRLResult(): number {
        return Math.max(this.getZeroGrade(), this.getHalfGrade(), this.getPerfectGrade());
    }
    isFinalQrlResult(): boolean {
        return !(this.gameService.currentQuestion?.type === QuestionType.QRL || this.gameService.currentState !== GameState.SHOW_FINAL_RESULTS);
    }
}
