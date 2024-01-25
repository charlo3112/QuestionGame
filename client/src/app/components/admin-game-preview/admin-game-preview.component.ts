import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminGameDetails } from '@app/classes/game-details';

@Component({
    selector: 'app-admin-game-preview',
    templateUrl: './admin-game-preview.component.html',
    styleUrls: ['./admin-game-preview.component.scss'],
})
export class AdminGamePreviewComponent {
    @Input() gameDetails: AdminGameDetails; // Replace 'any' with your game detail type
    @Output() edit = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() export = new EventEmitter<void>();
    @Output() toggleVisibility = new EventEmitter<void>();

    onEdit() {
        this.edit.emit();
    }

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
