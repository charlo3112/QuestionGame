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
import { Result } from '@app/interfaces/result';
import { CommunicationService } from '@app/services/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';
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
        this.subscription.add(
            this.communicationService.getAdminGames().subscribe({
                next: (result: Result<Game[]>) => {
                    if (result.ok && result.value) {
                        this.games = result.value;
                        this.games.forEach((game) => {
                            game.image = 'assets/logo.png';
                        });
                    } else {
                        this.openSnackBar('Error fetching games');
                    }
                },
                error: () => {
                    this.openSnackBar('Error fetching games');
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
        this.games = this.games.filter((game) => game.gameId !== id);
        this.communicationService.deleteGame(id).subscribe({
            error: (e) => {
                if (e.status !== HttpStatusCode.NotFound) {
                    this.openSnackBar('Error while deleting game');
                }
            },
        });
    }

    exportGame(id: string) {
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
                    this.openSnackBar('No data received');
                    this.games = this.games.filter((g) => g.gameId !== id);
                }
            },
            error: () => {
                this.openSnackBar('Error exporting game');
                this.games = this.games.filter((g) => g.gameId !== id);
            },
        });
    }

    toggleGameVisibility(id: string) {
        const game = this.games.find((g) => g.gameId === id);
        if (!game) {
            return;
        }

        game.visibility = !game.visibility;
        this.communicationService.toggleGameVisibility(id).subscribe({
            next: (response) => {
                if (response.body) {
                    const data = JSON.parse(response.body);
                    game.visibility = data.visibility; // to make sure the visibility is in sync
                }
            },
            error: (e) => {
                game.visibility = !game.visibility; // Revert the change
                this.openSnackBar('Error toggling game visibility');
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

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.communicationService.addGame(result).subscribe({
                    next: () => {
                        this.loadGames();
                        this.openSnackBar('Game added');
                    },
                    error: () => {
                        this.openSnackBar('Error adding game');
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
