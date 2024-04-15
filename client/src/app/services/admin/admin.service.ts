import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { Game } from '@common/interfaces/game';
import { Question } from '@common/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly sessionStorageService: SessionStorageService,
        private readonly validationService: ValidationService,
    ) {}

    get login(): boolean {
        return this.sessionStorageService.login;
    }

    async deleteGame(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.communicationService.deleteGame(id).subscribe({
                next: () => {
                    resolve();
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    }
    async exportGame(id: string): Promise<Partial<Game> | null> {
        return new Promise<Partial<Game> | null>((resolve, reject) => {
            this.communicationService.exportGame(id).subscribe({
                next: (response) => {
                    if (response.body) {
                        const game = JSON.parse(response.body) as unknown as Game;
                        const filteredOutput: Partial<Game> = {
                            title: game.title,
                            description: game.description,
                            duration: game.duration,
                            questions: game.questions.map((question: Question) => this.validationService.filterQuestionJSONInput(question)),
                        };
                        resolve(filteredOutput);
                    } else {
                        resolve(null);
                    }
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    }
    async toggleGameVisibility(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.communicationService.toggleGameVisibility(id).subscribe({
                next: (response) => {
                    if (response.body) {
                        const data = JSON.parse(response.body);
                        resolve(data.visibility);
                    }
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    }
    downloadFile(data: Partial<Game>, filename: string): void {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
    }

    handleLogin(success: boolean): void {
        this.sessionStorageService.login = success;
    }
}
