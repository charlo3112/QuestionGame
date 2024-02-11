import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Question, QuestionType } from '@app/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [PlayAreaComponent, SidebarComponent, QuestionBankComponent],
})
export class GamePageComponent {
    readonly question: Question = {
        type: QuestionType.Qcm,
        text: "Pourquoi le jus de lichi n'est pas bon?",
        points: 8,
        choices: [
            { text: 'Guillaume en boit' },
            { text: 'Guillaume a apporter 2 boites' },
            { text: "C'est du lichi" },
            { text: 'Guillaume en a bu a 9h du matin' },
        ],
    };
}
