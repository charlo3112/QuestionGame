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
import { Choice } from '@app/classes/choice';
import { AdminGamePreviewComponent } from '@app/components/admin-game-preview/admin-game-preview.component';
import { AdminLoginComponent } from '@app/components/admin-login/admin-login.component';
import { ImportDialogComponent } from '@app/components/import-dialog/import-dialog.component';
import { Game } from '@app/interfaces/game';
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
    login: boolean;

    games: Game[] = [];
    private subscription: Subscription = new Subscription();

    constructor(
        private readonly communicationService: CommunicationService,
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

    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }

    deleteGame(id: string) {
        const ERROR_DELETING_GAME = 'Erreur lors de la suppression du jeu';
        this.games = this.games.filter((game) => game.gameId !== id);
        this.communicationService.deleteGame(id).subscribe({
            error: (e) => {
                if (e.status !== HttpStatusCode.NotFound) {
                    this.openSnackBar(ERROR_DELETING_GAME);
                }
            },
        });
    }

    exportGame(id: string) {
        const ERROR_EXPORTING_GAME = "Erreur lors de l'exportation du jeu";
        const ERROR_NO_DATA = 'Aucune données reçues';
        this.communicationService.exportGame(id).subscribe({
            next: (response) => {
                if (response.body) {
                    const game = JSON.parse(response.body) as unknown as Game;
                    const filteredOutput: Partial<Game> = {
                        title: game.title,
                        description: game.description,
                        duration: game.duration,
                        questions: game.questions.map((question) => ({
                            type: question.type,
                            text: question.text,
                            points: question.points,
                            choices: question.choices?.map((choice) => ({ choice: choice.text, isCorrect: choice.isCorrect }) as unknown as Choice),
                        })),
                    };

                    this.downloadFile(filteredOutput, `game-${id}.json`);
                } else {
                    this.openSnackBar(ERROR_NO_DATA);
                    this.games = this.games.filter((g) => g.gameId !== id);
                }
            },
            error: () => {
                this.openSnackBar(ERROR_EXPORTING_GAME);
                this.games = this.games.filter((g) => g.gameId !== id);
            },
        });
    }

    toggleGameVisibility(id: string) {
        const ERROR_GAME_VISIBILITY = 'Erreur lors du changement de visibilité';
        const game = this.games.find((g) => g.gameId === id);
        if (!game) {
            return;
        }

        game.visibility = !game.visibility;
        this.communicationService.toggleGameVisibility(id).subscribe({
            next: (response) => {
                if (response.body) {
                    const data = JSON.parse(response.body);
                    game.visibility = data.visibility;
                }
            },
            error: (e) => {
                game.visibility = !game.visibility;
                this.openSnackBar(ERROR_GAME_VISIBILITY);
                if (e.status === HttpStatusCode.NotFound) {
                    this.games = this.games.filter((g) => g.gameId !== id);
                }
            },
        });
    }

    handleLogin(success: boolean) {
        this.login = success;
        sessionStorage.setItem('login', JSON.stringify(this.login));
    }

    openImportDialog(): void {
        const dialogRef = this.dialog.open(ImportDialogComponent);
        const ERROR_ADDING_GAME = "Erreur lors de l'ajout du jeu";
        const GAME_ADDED = 'Jeu ajouté avec succès !';

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

    private downloadFile(data: Partial<Game>, filename: string) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
    }
}
