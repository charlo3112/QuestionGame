import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { Game } from '@common/interfaces/game';
import { Result } from '@common/interfaces/result';
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

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private readonly communicationService: CommunicationService,
        private snackBar: MatSnackBar,
        private webSocketService: WebSocketService,
        private gameService: GameService,
    ) {
        this.loadGames();
        this.gameService.reset();
    }

    loadGames(): void {
        const ERROR_FETCHING_GAMES = "Erreur lors de l'obtention des jeux";
        this.subscription.add(
            this.communicationService.getGames().subscribe({
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
        this.snackBar.open(message, 'Close', {
            duration: 4000,
        });
    }

    startGame(game: Game) {
        const gameId = game.gameId;
        const GAME_DELETED = 'Jeux supprimé, veuillez en choisir un autre';
        const GAME_INVISIBLE = 'Jeux invisible, veuillez en choisir un autre';

        this.communicationService
            .getGameByID(gameId)
            .pipe(
                tap((result: Result<Game>) => {
                    if (!result.ok || !result.value) {
                        this.openSnackBar(GAME_DELETED);
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
                        this.gameService.setTest(false);
                        this.router.navigate(['/loading']);
                    } else {
                        this.openSnackBar(GAME_INVISIBLE);
                        this.loadGames();
                    }
                }
            });
    }

    testGame(game: Game) {
        const gameId = game.gameId;
        const GAME_DELETED = 'Jeux supprimé, veuillez en choisir un autre';
        const GAME_INVISIBLE = 'Jeux invisible, veuillez en choisir un autre';

        this.communicationService
            .getGameByID(gameId)
            .pipe(
                tap((result: Result<Game>) => {
                    if (!result.ok || !result.value) {
                        this.openSnackBar(GAME_DELETED);
                        this.loadGames();
                    }
                }),
            )
            .subscribe(async (result: Result<Game>) => {
                if (result.ok && result.value) {
                    const newGame = result.value;
                    if (newGame.visibility) {
                        const user = await this.webSocketService.testGame(newGame.gameId);
                        sessionStorage.setItem('user', JSON.stringify(user));
                        this.gameService.setTest(true);
                        this.gameService.init();
                        this.router.navigate(['/game']);
                    } else {
                        this.openSnackBar(GAME_INVISIBLE);
                        this.loadGames();
                    }
                }
            });
    }
}
