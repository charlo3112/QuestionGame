import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppMaterialModule } from '@app/modules/material.module';
import { Game } from '@common/interfaces/game';

@Component({
    selector: 'app-start-game-expansion',
    templateUrl: './start-game-expansion.component.html',
    styleUrls: ['./start-game-expansion.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, NgFor, NgIf],
})
export class StartGameExpansionComponent {
    @Input() gameDetails: Game;
    @Output() startGame = new EventEmitter<void>();
    @Output() testGame = new EventEmitter<void>();

    onStartGame(): void {
        this.startGame.emit();
    }

    onTestGame(): void {
        this.testGame.emit();
    }
}
