import { NgFor, NgIf } from '@angular/common';
import { HttpStatusCode } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AdminGameDetails } from '@app/classes/game-details';
import { AdminGamePreviewComponent } from '@app/components/admin-game-preview/admin-game-preview.component';
import { AdminLoginComponent } from '@app/components/admin-login/admin-login.component';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        AdminGamePreviewComponent,
        AdminLoginComponent,
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatGridListModule,
        MatToolbarModule,
        MatSnackBarModule,
    ],
})
export class AdminPageComponent {
    login: boolean = true;
    // load login from session storage

    games: AdminGameDetails[] = [
        new AdminGameDetails('id', 'Game 1rjntjrjtrjtjrtrtrjtjrtnjrjtn', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id2', 'Game 2', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id3', 'Game 3', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id4', 'Game 4', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id5', 'Game 5', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id6', 'Game 6', '#', 'description', true, '2021-03-03'),
        new AdminGameDetails('id7', 'Game 7', '#', 'description', true, '2021-03-03'),
    ];

    constructor(
        private readonly communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {
        const storedLogin = sessionStorage.getItem('login');
        if (storedLogin !== null) {
            this.login = JSON.parse(storedLogin);
        } else {
            this.login = false;
            sessionStorage.setItem('login', JSON.stringify(this.login));
        }
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action);
    }

    deleteGame(id: string) {
        this.games = this.games.filter((game) => game.id !== id);
        this.communicationService.deleteGame(id).subscribe({
            error: (e) => {
                if (e.status !== HttpStatusCode.NotFound) {
                    this.openSnackBar('Error while deleting game', 'Close');
                }
            },
        });
    }

    exportGame(id: string) {
        this.communicationService.exportGame(id).subscribe({
            next: (response) => {
                const blob = response.body;
                if (blob) {
                    this.downloadFile(blob, `game-${id}.json`);
                } else {
                    this.openSnackBar('No data received', 'Close');
                    this.games = this.games.filter((g) => g.id !== id);
                }
            },
            error: () => {
                this.openSnackBar('Error exporting game', 'Close');
                this.games = this.games.filter((g) => g.id !== id);
            },
        });
    }

    toggleGameVisibility(id: string) {
        const game = this.games.find((g) => g.id === id);
        if (!game) {
            return;
        }

        this.communicationService.toggleGameVisibility(id, !game.isVisible).subscribe({
            next: () => (game.isVisible = !game.isVisible),
            error: (e) => {
                this.openSnackBar('Error toggling game visibility', 'Close');
                if (e.status === HttpStatusCode.NotFound) {
                    this.games = this.games.filter((g) => g.id !== id);
                }
            },
        });
    }

    handleLogin(success: boolean) {
        this.login = success;
        sessionStorage.setItem('login', JSON.stringify(this.login));
    }

    // upload() {
    //     alert('Upload');
    // }

    private downloadFile(data: Blob, filename: string) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(data);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
    }
}
