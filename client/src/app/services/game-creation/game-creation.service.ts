/* eslint-disable max-params */
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Game, GAME_PLACEHOLDER } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameCreationService {
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly validationService: ValidationService,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {}
    async save(
        newTitle: string,
        newDescription: string,
        newDuration: number,
        newQuestions: Question[],
        newVisibility: boolean,
        id: string,
        isEditing: boolean,
    ): Promise<void> {
        const ERROR_VALIDATION = 'Erreurs de validation: \n';
        const gameToValidate: Partial<Game> = {
            title: newTitle,
            description: newDescription,
            duration: newDuration,
            questions: newQuestions,
        };
        const validationErrors = this.validationService.validateGame(gameToValidate);
        if (validationErrors.length > 0) {
            this.snackBar.open(ERROR_VALIDATION + validationErrors.join('\n'), undefined, {
                duration: SNACKBAR_DURATION,
            });
            return;
        }
        const newGame: Game = {
            ...GAME_PLACEHOLDER,
            ...gameToValidate,
            lastModification: new Date().toISOString(),
            visibility: newVisibility,
        };

        if (isEditing) {
            newGame.gameId = id;
            await this.updateGame(newGame);
        } else {
            await this.createGame(newGame);
        }
    }

    async createGame(game: Game): Promise<void> {
        const GAME_CREATED = 'Le jeu a été créé avec succès !';
        const ERROR_CREATING_GAME = 'Erreur lors de la création du jeu';
        try {
            await lastValueFrom(this.communicationService.addGame(game));
            this.snackBar.open(GAME_CREATED, undefined, {
                duration: SNACKBAR_DURATION,
            });
            this.router.navigate(['/admin']);
        } catch (e) {
            this.snackBar.open(ERROR_CREATING_GAME, undefined, {
                duration: SNACKBAR_DURATION,
            });
        }
    }

    async updateGame(game: Game): Promise<void> {
        const GAME_MODIFIED = 'Le jeu a été modifié avec succès !';
        const ERROR_UPDATING_GAME = 'Erreur lors de la modification du jeu';
        try {
            await lastValueFrom(this.communicationService.editGame(game));
            this.snackBar.open(GAME_MODIFIED, undefined, {
                duration: SNACKBAR_DURATION,
            });
            this.router.navigate(['/admin']);
        } catch (e) {
            this.snackBar.open(ERROR_UPDATING_GAME, undefined, {
                duration: SNACKBAR_DURATION,
            });
        }
    }
}
