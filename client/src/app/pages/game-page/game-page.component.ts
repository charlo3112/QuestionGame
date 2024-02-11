import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Question, QuestionType } from '@app/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    standalone: true,
    imports: [PlayAreaComponent, SidebarComponent],
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
