import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QuestionComponent } from '@app/components/question/question.component';
import { Question, questions } from '@app/interfaces/question';
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
    placeholderQuestions = questions;

    constructor(private readonly gameService: GameService) {}

    get question(): Question | undefined {
        return this.gameService.currentQuestion;
    }

    ngOnInit(): void {
        const state = window.history.state;
        if (state && state.questions) {
            this.gameService.startGame(state.questions);
        } else {
            this.gameService.startGame(this.placeholderQuestions); // Starts with placeholder questions
        }
    }
}
