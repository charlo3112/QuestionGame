import { NgFor, NgIf } from '@angular/common';
import { HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AdminGamePreviewComponent } from '@app/components/admin-game-preview/admin-game-preview.component';
import { AdminLoginComponent } from '@app/components/admin-login/admin-login.component';
import { ImportDialogComponent } from '@app/components/import-dialog/import-dialog.component';
import { Game } from '@app/interfaces/game';
import { AdminService } from '@app/services/admin/admin.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { Result } from '@common/result';
import { Subscription } from 'rxjs';

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
        MatDialogModule,
    ],
})
export class AdminPageComponent implements OnInit {
    games: Game[] = [];
    login: boolean;
    private subscription: Subscription = new Subscription();

    // We had to disable the max-params rule because we need every parameter for the component to work
    // eslint-disable-next-line max-params
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly adminService: AdminService,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.loadGames();
        const storedLogin = sessionStorage.getItem('login');
        if (storedLogin !== null) {
            this.login = JSON.parse(storedLogin);
        } else {
            this.login = false;
            sessionStorage.setItem('login', JSON.stringify(this.login));
        }
    }
    deleteGame(id: string) {
        const ERROR_DELETING_GAME = 'Erreur lors de la suppression du jeu';
        this.adminService
            .deleteGame(id)
            .then(() => {
                this.games = this.games.filter((game) => game.gameId !== id);
            })
            .catch((error) => {
                if (error.status !== HttpStatusCode.NotFound) {
                    this.openSnackBar(ERROR_DELETING_GAME);
                }
            });
    }
    exportGame(id: string) {
        const ERROR_EXPORTING_GAME = "Erreur lors de l'exportation du jeu";
        const ERROR_NO_DATA = 'Aucune données reçues';
        this.adminService
            .exportGame(id)
            .then((filteredOutput) => {
                if (filteredOutput) {
                    this.downloadFile(filteredOutput, `game-${id}.json`);
                } else {
                    this.openSnackBar(ERROR_NO_DATA);
                    this.games = this.games.filter((g) => g.gameId !== id);
                }
            })
            .catch(() => {
                this.openSnackBar(ERROR_EXPORTING_GAME);
                this.games = this.games.filter((g) => g.gameId !== id);
            });
    }
    handleLogin(success: boolean) {
        this.login = success;
        this.adminService.handleLogin(this.login);
    }
    loadGames(): void {
        const ERROR_FETCHING_GAMES = "Erreur lors de l'obtention des jeux";
        this.subscription.add(
            this.communicationService.getAdminGames().subscribe({
                next: (result: Result<Game[]>) => {
                    if (result.ok && result.value) {
                        this.games = result.value;
                        this.games.forEach((game) => {
                            game.image = 'assets/logo.png';
                        });
                    } else {
                        this.openSnackBar(ERROR_FETCHING_GAMES);
                    }
                },
                error: () => {
                    this.openSnackBar(ERROR_FETCHING_GAMES);
                },
            }),
        );
    }
    openImportDialog(): void {
        const ERROR_ADDING_GAME = "Erreur lors de l'ajout du jeu";
        const GAME_ADDED = 'Jeu ajouté avec succès !';
        const dialogRef = this.dialog.open(ImportDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.communicationService.addGame(result).subscribe({
                    next: () => {
                        this.loadGames();
                        this.openSnackBar(GAME_ADDED);
                    },
                    error: () => {
                        this.openSnackBar(ERROR_ADDING_GAME);
                    },
                });
            }
        });
    }
    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }
    toggleGameVisibility(id: string) {
        const ERROR_GAME_VISIBILITY = 'Erreur lors du changement de visibilité';
        const game = this.games.find((g) => g.gameId === id);
        if (!game) {
            return;
        }
        game.visibility = !game.visibility;

        this.adminService
            .toggleGameVisibility(id)
            .then((visibility) => {
                game.visibility = visibility;
            })
            .catch((error) => {
                game.visibility = !game.visibility;
                this.openSnackBar(ERROR_GAME_VISIBILITY);
                if (error.status === HttpStatusCode.NotFound) {
                    this.games = this.games.filter((g) => g.gameId !== id);
                }
            });
    }
    private downloadFile(data: Partial<Game>, filename: string) {
        this.adminService.downloadFile(data, filename);
    }
}
