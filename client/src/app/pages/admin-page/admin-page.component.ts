import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AdminGameDetails } from '@app/classes/game-details';
import { AdminGamePreviewComponent } from '@app/components/admin-game-preview/admin-game-preview.component';
import { AdminLoginComponent } from '@app/components/admin-login/admin-login.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, AdminGamePreviewComponent, AdminLoginComponent, RouterLink, MatButtonModule, MatIconModule, MatGridListModule, MatToolbarModule],
})
export class AdminPageComponent {
    login: boolean = false;

    games: AdminGameDetails[] = [
        new AdminGameDetails('id', 'Game 1rjntjrjtrjtjrtrtrjtjrtnjrjtn', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id2', 'Game 2', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id3', 'Game 3', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id4', 'Game 4', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id5', 'Game 5', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id6', 'Game 6', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id7', 'Game 7', '#', 'description', true, '2021-03-03'),
    ];

    editGame(id: string) {
        alert(`Edit game with id ${id}`);

        // TODO: Add server call to edit game
    }

    deleteGame(id: string) {
        alert(`Delete game with id ${id}`);

        // TODO: Add server call to delete game
    }

    exportGame(id: string) {
        alert(`Export game with id ${id}`);

        // TODO: Add server call to export game
    }

    toggleGameVisibility(id: string) {
        const game = this.games.find((g) => g.id === id);
        if (!game) {
            return;
        }
        game.isVisible = !game.isVisible;

        // TODO: Add server call to update game visibility
    }

    handleLogin(success: boolean) {
        this.login = success;
    }

    upload() {
        alert('Upload');
    }
}
