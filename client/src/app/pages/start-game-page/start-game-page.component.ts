import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { StartGameExpansionComponent } from '@app/components/start-game-expansion/start-game-expansion.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { Game } from '@common/interfaces/game';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-start-game-page',
    templateUrl: './start-game-page.component.html',
    styleUrls: ['./start-game-page.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, RouterLink, CommonModule, StartGameExpansionComponent],
})
export class StartGamePageComponent implements OnInit {
    games: Game[] = [];
    canCreateRandom = false;

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly snackBar: MatSnackBar,
        private readonly gameService: GameService,
    ) {}

    async ngOnInit(): Promise<void> {
        await this.verifyRandomGame();
        await this.loadGames();
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
                this.snackBar.open(ERROR_FETCHING_GAMES, undefined, { duration: SNACKBAR_DURATION });
            }
        } catch (error) {
            this.snackBar.open(ERROR_FETCHING_GAMES, undefined, { duration: SNACKBAR_DURATION });
        }
    }

    async verifyRandomGame(): Promise<void> {
        try {
            this.canCreateRandom = await firstValueFrom(this.communicationService.canCreateRandom());
        } catch (error) {
            this.snackBar.open('Erreur lors de la vérification de la création de jeu aléatoire', undefined, { duration: SNACKBAR_DURATION });
        }
    }

    async startGame(game: Game): Promise<void> {
        if (!(await this.gameService.startGame(game))) {
            await this.loadGames();
        }
    }

    async startRandomGame(): Promise<void> {
        if (this.canCreateRandom) {
            if (await this.gameService.startRandomGame()) {
                return;
            }
        }

        this.snackBar.open('Impossible de créer un jeu aléatoire', undefined, { duration: SNACKBAR_DURATION });
        await this.verifyRandomGame();
    }

    async testGame(game: Game): Promise<void> {
        if (!(await this.gameService.testGame(game))) {
            await this.loadGames();
        }
    }
}
