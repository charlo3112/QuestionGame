import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { Game } from '@common/interfaces/game';
import { Result } from '@common/interfaces/result';
import { firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-start-game-page',
    templateUrl: './startgame-page.component.html',
    styleUrls: ['./startgame-page.component.scss'],
    standalone: true,
    imports: [RouterModule, CommonModule, MatExpansionModule, StartGameExpansionComponent, MatToolbarModule, MatSnackBarModule],
})
export class StartGamePageComponent implements OnInit {
    games: Game[] = [];
    title: string = 'Liste de jeux';
    canCreateRandom = true;

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private readonly communicationService: CommunicationService,
        private readonly sessionStorageService: SessionStorageService,
        private snackBar: MatSnackBar,
        private webSocketService: WebSocketService,
        private gameService: GameService,
    ) {}

    async ngOnInit(): Promise<void> {
        await this.loadGames();
        await this.verifyRandomGame();
        this.gameService.reset();
        this.gameService.leaveRoom();
    }

    async loadGames(): Promise<void> {
        const ERROR_FETCHING_GAMES = "Erreur lors de l'obtention des jeux";
        try {
            const result = await firstValueFrom(this.communicationService.getGames());
            if (result.ok && result.value) {
                this.games = result.value;
                this.games.forEach((game) => {
                    game.image = 'assets/logo.png';
                });
            } else {
                this.openSnackBar(ERROR_FETCHING_GAMES);
            }
        } catch (error) {
            this.openSnackBar(ERROR_FETCHING_GAMES);
        }
    }

    async verifyRandomGame(): Promise<void> {
        try {
            this.canCreateRandom = await firstValueFrom(this.communicationService.canCreateRandom());
        } catch (error) {
            this.openSnackBar('Erreur lors de la vérification de la création de jeu aléatoire');
        }
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
                        this.sessionStorageService.user = user;
                        this.sessionStorageService.test = false;
                        this.router.navigate(['/loading']);
                    } else {
                        this.openSnackBar(GAME_INVISIBLE);
                        this.loadGames();
                    }
                }
            });
    }

    async startRandomGame() {
        if (this.canCreateRandom) {
            const user = await this.webSocketService.startRandom();
            if (user) {
                this.sessionStorageService.user = user;
                this.sessionStorageService.test = false;
                this.router.navigate(['/loading']);
                return;
            }
        }
        this.openSnackBar('Impossible de créer un jeu aléatoire');
        await this.verifyRandomGame();
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
                        this.sessionStorageService.test = true;
                        const user = await this.webSocketService.testGame(newGame.gameId);
                        this.sessionStorageService.user = user;
                        this.webSocketService.startTest();
                        this.router.navigate(['/game']);
                    } else {
                        this.openSnackBar(GAME_INVISIBLE);
                        this.loadGames();
                    }
                }
            });
    }
}
