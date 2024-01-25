import { Component } from '@angular/core';
import { AdminGameDetails } from '@app/classes/game-details';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    games: AdminGameDetails[] = [
        new AdminGameDetails('id', 'Game 1rjntjrjtrjtjrtrtrjtjrtnjrjtn', 'url-to-image', 'description', true, new Date()),
        new AdminGameDetails('id2', 'Game 2', 'url-to-image', 'description', true, new Date()),
        new AdminGameDetails('id3', 'Game 3', 'url-to-image', 'description', true, new Date()),
        new AdminGameDetails('id4', 'Game 4', 'url-to-image', 'description', true, new Date()),
        new AdminGameDetails('id5', 'Game 5', 'url-to-image', 'description', true, new Date()),
        new AdminGameDetails('id6', 'Game 6', 'url-to-image', 'description', true, new Date()),
        new AdminGameDetails('id7', 'Game 7', 'url-to-image', 'description', true, new Date()),
        // ... other games
    ];

    editGame(id: string) {
        alert(`Edit game with id ${id}`);
    }

    deleteGame(id: string) {
        // Logic to delete game by id
        alert(`Delete game with id ${id}`);
    }

    exportGame(id: string) {
        // Logic to export game by id
        alert(`Export game with id ${id}`);
    }

    toggleGameVisibility(id: string) {
        // Logic to toggle visibility of the game by id
        // This could be an update to the game's details and a subsequent refresh of the list
        // alert(`Toggle visibility of game with id ${id}`);
        const game = this.games.find((g) => g.id === id);
        if (!game) {
            return;
        }
        game.isVisible = !game.isVisible;
    }
}
