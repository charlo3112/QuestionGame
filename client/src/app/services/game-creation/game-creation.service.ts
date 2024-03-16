import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication/communication.service';
import { NOT_FOUND, SNACKBAR_DURATION } from '@common/constants';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameCreationService {
    constructor(
        private readonly communicationService: CommunicationService,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {}

    insertQuestion(question: Question, questions: Question[]): void {
        const index = questions.findIndex((q) => q.text === question.text);
        if (index > NOT_FOUND) {
            questions[index] = question;
        } else {
            questions.push(question);
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
