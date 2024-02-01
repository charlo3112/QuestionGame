import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { AdminGameDetails } from '@app/classes/game-details';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { MatToolbarModule } from '@angular/material/toolbar';

const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ullamcorper, leo vel elementum congue, libero leo pharetra nulla, sit amet pulvinar risus arcu ut nunc. Curabitur at ipsum interdum, efficitur odio a, ornare lacus. Pellentesque blandit dui massa, in faucibus dui finibus a. Aenean et ex sed velit viverra porta. Fusce non blandit urna, eget pretium ligula. Fusce in commodo nulla. Phasellus a odio metus. ";

@Component({
    selector: 'app-start-game-page',
    templateUrl: './startgame-page.component.html',
    styleUrls: ['./startgame-page.component.scss'],
    standalone: true,
    imports: [RouterModule, CommonModule, MatExpansionModule, StartGameExpansionComponent, MatToolbarModule],
})
export class StartGamePageComponent {
    // Template games to finish functionality
    games: AdminGameDetails[] = [
        new AdminGameDetails('id1', 'Game 1', '#', description, true, '2021-03-03'),
        new AdminGameDetails('id2', 'Game 2', '#', description, true, '2021-03-03'),
        new AdminGameDetails('id3', 'Game 3', '#', description, true, '2021-03-03'),
        new AdminGameDetails('id4', 'Game 4', '#', description, true, '2021-03-03'),
        new AdminGameDetails('id5', 'Game 5', '#', description, true, '2021-03-03'),
        new AdminGameDetails('id6', 'Game 6', '#', description, true, '2021-03-03'),
        new AdminGameDetails('id7', 'Game 7', '#', description, true, '2021-03-03'),
    ];
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
