import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-erase-history-dialog',
    templateUrl: './erase-history-dialog.component.html',
    styleUrls: ['./erase-history-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class EraseHistoryDialogComponent {
    constructor(private readonly dialogRef: MatDialogRef<EraseHistoryDialogComponent>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
}
