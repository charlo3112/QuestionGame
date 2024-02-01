import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AdminGameDetails } from '@app/classes/game-details';

@Component({
    selector: 'app-admin-game-preview',
    templateUrl: './admin-game-preview.component.html',
    styleUrls: ['./admin-game-preview.component.scss'],
    standalone: true,
    imports: [MatIconModule, RouterLink],
})
export class AdminGamePreviewComponent {
    @Input() gameDetails: AdminGameDetails;
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
