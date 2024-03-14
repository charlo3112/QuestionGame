import { Injectable } from '@angular/core';
import { Choice } from '@app/classes/choice';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication/communication.service';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    constructor(private readonly communicationService: CommunicationService) {}

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
                            questions: game.questions.map((question) => ({
                                type: question.type,
                                text: question.text,
                                points: question.points,
                                choices: question.choices?.map(
                                    (choice) =>
                                        ({
                                            choice: choice.text,
                                            isCorrect: choice.isCorrect,
                                        }) as unknown as Choice,
                                ),
                            })),
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
    downloadFile(data: Partial<Game>, filename: string) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
    }
    handleLogin(success: boolean): void {
        sessionStorage.setItem('login', JSON.stringify(success));
    }
}
