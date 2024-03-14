import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Game } from '@common/interfaces/game';

@Component({
    selector: 'app-admin-game-preview',
    templateUrl: './admin-game-preview.component.html',
    styleUrls: ['./admin-game-preview.component.scss'],
    standalone: true,
    imports: [MatIconModule, MatCardModule, MatButtonModule, RouterLink],
})
export class AdminGamePreviewComponent {
    @Input() gameDetails: Game;
    @Output() delete = new EventEmitter<void>();
    @Output() export = new EventEmitter<void>();
    @Output() toggleVisibility = new EventEmitter<void>();

    onDelete() {
        this.delete.emit();
    }

    onExport() {
        this.export.emit();
    }

    onToggleVisibility() {
        this.toggleVisibility.emit();
    }
}
