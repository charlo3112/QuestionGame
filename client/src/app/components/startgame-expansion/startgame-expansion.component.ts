import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdminGameDetails } from '@app/classes/game-details';

@Component({
    selector: 'app-startgame-expansion',
    templateUrl: './startgame-expansion.component.html',
    styleUrls: ['./startgame-expansion.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatExpansionModule],
})
export class StartGameExpansionComponent {
    @Input() gameDetails: AdminGameDetails;
    @Output() startGame = new EventEmitter<void>();
    @Output() testGame = new EventEmitter<void>();

    onStartGame() {
        this.startGame.emit();
    }

    onTestGame() {
        this.testGame.emit();
    }
}