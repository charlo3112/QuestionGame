import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameService } from '@app/services/game.service';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [QuestionComponent, CommonModule],
})
export class GamePageComponent implements OnInit {
    questions: Question[] = [];

    constructor(private readonly gameService: GameService) {}

    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    ngOnInit(): void {
        const state = window.history.state;
        if (state && state.game) {
            this.gameService.startGame(state.game);
        }
    }
}
