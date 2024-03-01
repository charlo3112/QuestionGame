import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication.service';
import { WebSocketService } from '@app/services/websocket.service';
import { Result } from '@common/result';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-start-game-page',
    templateUrl: './startgame-page.component.html',
    styleUrls: ['./startgame-page.component.scss'],
    standalone: true,
    imports: [RouterModule, CommonModule, MatExpansionModule, StartGameExpansionComponent, MatToolbarModule, MatSnackBarModule],
})
export class StartGamePageComponent {
    games: Game[] = [];

    title: string = 'Liste de jeux';
    private subscription = new Subscription();
    constructor(
        private router: Router,
        private readonly communicationService: CommunicationService,
        private snackBar: MatSnackBar,
        private webSocketService: WebSocketService,
    ) {
        this.loadGames();
    }

    loadGames(): void {
        this.subscription.add(
            this.communicationService.getGames().subscribe({
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
        this.snackBar.open(message, 'Close', {
            duration: 4000,
        });
    }

    startGame(game: Game) {
        const gameId = game.gameId;

        this.communicationService
            .getGameByID(gameId)
            .pipe(
                tap((result: Result<Game>) => {
                    if (!result.ok || !result.value) {
                        this.openSnackBar('Jeux supprimé, veuillez en choisir un autre');
                        this.loadGames();
                    }
                }),
            )
            .subscribe(async (result: Result<Game>) => {
                if (result.ok && result.value) {
                    const newGame = result.value;
                    if (newGame.visibility) {
                        const user = await this.webSocketService.createRoom(newGame.gameId);
                        sessionStorage.setItem('user', JSON.stringify(user));
                        this.router.navigate(['/loading']);
                    } else {
                        this.openSnackBar('Jeux invisible, veuillez en choisir un autre');
                        this.loadGames();
                    }
                }
            });
    }

    testGame(game: Game) {
        const gameId = game.gameId;

        this.communicationService
            .getGameByID(gameId)
            .pipe(
                tap((result: Result<Game>) => {
                    if (!result.ok || !result.value) {
                        this.openSnackBar('Jeux supprimé, veuillez en choisir un autre');
                        this.loadGames();
                    }
                }),
            )
            .subscribe((result: Result<Game>) => {
                if (result.ok && result.value) {
                    const newGame = result.value;
                    if (newGame.visibility) {
                        this.router.navigate(['/game'], { state: { game: newGame } });
                    } else {
                        this.openSnackBar('Jeux invisible, veuillez en choisir un autre');
                        this.loadGames();
                    }
                }
            });
    }
}
