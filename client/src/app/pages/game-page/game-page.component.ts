import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [CommonModule, PlayAreaComponent],
})
export class GamePageComponent {
    constructor(private readonly gameService: GameService) {}

    get question(): Question | undefined {
        return this.gameService.getCurrent();
    }
}
