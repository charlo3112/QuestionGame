import { Component } from '@angular/core';
import { QuestionComponent } from '@app/components/question/question.component';
import { QUESTION_PLACEHOLDER, Question } from '@app/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [QuestionComponent],
})
export class GamePageComponent {
    readonly question: Question = QUESTION_PLACEHOLDER;
}
