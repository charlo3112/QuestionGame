import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { GAME_PLACEHOLDER, Game } from '@app/interfaces/game';

// const description =
//     'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
//     ' Integer ullamcorper, leo vel elementum congue, libero leo pharetra nulla, sit amet pulvinar risus arcu ut nunc.' +
//     ' Curabitur at ipsum interdum, efficitur odio a, ornare lacus. Pellentesque blandit dui massa, in faucibus dui finibus a.' +
//     'Aenean et ex sed velit viverra porta. Fusce non blandit urna, eget pretium ligula. Fusce in commodo nulla. Phasellus a odio metus.';

@Component({
    selector: 'app-start-game-page',
    templateUrl: './startgame-page.component.html',
    styleUrls: ['./startgame-page.component.scss'],
    standalone: true,
    imports: [RouterModule, CommonModule, MatExpansionModule, StartGameExpansionComponent, MatToolbarModule],
})
export class StartGamePageComponent {
    // Template games to finish functionality
    games: Game[] = [GAME_PLACEHOLDER, GAME_PLACEHOLDER, GAME_PLACEHOLDER];

    title: string = 'Liste de jeux';

    startGame(id: string) {
        alert('Start game with id ' + id);
        // TODO: Add server call to start game
    }

    testGame(id: string) {
        alert('Test game with id ' + id);
        // TODO: Add server call to test game
    }
}
