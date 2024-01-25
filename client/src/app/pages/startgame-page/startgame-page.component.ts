import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { StartGameDialogComponent } from '@app/components/start-game-dialog/start-game-dialog/start-game-dialog.component';

export interface GameType {
    id: number;
    name: string;
    time: string;
    description: string;
}

@Component({
    selector: 'app-startgame-page',
    templateUrl: './startgame-page.component.html',
    styleUrls: ['./startgame-page.component.scss'],
    standalone: true,
    imports: [RouterModule, MatButtonModule, MatDialogModule, CommonModule],
})
export class StartGamePageComponent {
    // Template games to finish functionality
    games: GameType[] = [
        { id: 1, name: 'Jeu 1', time: '10 min', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: 2, name: 'Jeu 2', time: '20 min', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: 3, name: 'Jeu 3', time: '30 min', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: 4, name: 'Jeu 4', time: '40 min', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: 5, name: 'Jeu 5', time: '50 min', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ];
    title: string = 'Jeu de test';

    constructor(private dialog: MatDialog) {}

    openDialog(game: GameType): void {
        // TODO: Add other params (Desc, etc.)
        this.dialog.open(StartGameDialogComponent, {
            width: '1000px',
            data: { gameObject: game }, // TODO: Add other info
        });
    }
}
