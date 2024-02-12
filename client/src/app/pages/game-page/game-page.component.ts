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
    imports: [CommonModule, QuestionComponent],
})
export class GamePageComponent implements OnInit {
    constructor(private readonly gameService: GameService) {}

    get question(): Question | undefined {
        return this.gameService.getCurrent();
    }

    ngOnInit(): void {
        this.gameService.startGame(questions);
    }
}
