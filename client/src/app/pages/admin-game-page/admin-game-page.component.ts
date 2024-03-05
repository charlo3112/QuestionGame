import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { QUESTION_PLACEHOLDER, Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-admin-game-page',
    templateUrl: './admin-game-page.component.html',
    styleUrls: ['./admin-game-page.component.scss'],
    imports: [
        ChatComponent,
        LeaderboardComponent,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        MatToolbarModule,
        AnswersComponent,
    ],
    standalone: true,
})
export class AdminGamePageComponent {
    @Input() question: Question;

    constructor(readonly gameService: GameService) {}

    fetchQuestion() {
        this.question = QUESTION_PLACEHOLDER;
    }
}
