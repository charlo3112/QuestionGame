import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QuestionComponent } from '@app/components/question/question.component';
import { GAME_PLACEHOLDER } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [QuestionComponent, CommonModule],
})
export class GamePageComponent implements OnInit {
    questions: Question[] = [];
    placeholder = GAME_PLACEHOLDER;

    constructor(private readonly gameService: GameService) {}

    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    ngOnInit(): void {
        const state = window.history.state;
        if (state && state.game) {
            this.gameService.startGame(state.game);
        } else {
            this.gameService.startGame(this.placeholder); // Starts with placeholder questions
        }
    }
}
