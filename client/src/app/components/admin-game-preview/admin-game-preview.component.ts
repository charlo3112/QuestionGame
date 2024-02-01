import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminGameDetails } from '@app/classes/game-details';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-admin-game-preview',
    templateUrl: './admin-game-preview.component.html',
    styleUrls: ['./admin-game-preview.component.scss'],
    standalone: true,
    imports: [MatIconModule, MatCardModule, MatButtonModule],
})
export class AdminGamePreviewComponent {
    @Input() gameDetails: AdminGameDetails;
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
