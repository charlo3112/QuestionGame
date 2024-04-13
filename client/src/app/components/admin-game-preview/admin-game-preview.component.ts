import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { Game } from '@common/interfaces/game';

@Component({
    selector: 'app-admin-game-preview',
    templateUrl: './admin-game-preview.component.html',
    styleUrls: ['./admin-game-preview.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, RouterLink],
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
