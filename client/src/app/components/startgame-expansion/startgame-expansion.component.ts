import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-startgame-expansion',
    templateUrl: './startgame-expansion.component.html',
    styleUrls: ['./startgame-expansion.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatExpansionModule, NgFor, NgIf, MatSnackBarModule],
})
export class StartGameExpansionComponent {
    @Input() gameDetails: Game;
    @Output() startGame = new EventEmitter<void>();
    @Output() testGame = new EventEmitter<void>();
    @Output() refreshGames = new EventEmitter<void>();

    constructor(private snackBar: MatSnackBar) {}

    onStartGame(game: Game) {
        if (!game.visibility || !game) {
            this.snackBar.open('Game is not visible or deleted. Refreshing games...', 'Close');
            this.onRefreshGames();
        } else {
            this.startGame.emit();
        }
    }

    onTestGame(game: Game) {
        if (!game.visibility || !game) {
            this.onRefreshGames();
            this.snackBar.open('Game is not visible or deleted. Refreshing games...', 'Close');
        } else {
            this.testGame.emit();
        }
    }

    onRefreshGames() {
        this.refreshGames.emit();
    }
}
