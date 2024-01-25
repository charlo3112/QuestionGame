import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { QUESTION_PLACEHOLDER, Question } from '@app/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [QuestionComponent, PlayAreaComponent, SidebarComponent],
})
export class GamePageComponent {
    readonly question: Question = QUESTION_PLACEHOLDER;
}
