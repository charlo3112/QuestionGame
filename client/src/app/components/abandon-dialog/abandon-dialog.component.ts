import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-abandon-dialog',
    templateUrl: './abandon-dialog.component.html',
    styleUrls: ['./abandon-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class AbandonDialogComponent {
    constructor(private readonly dialogRef: MatDialogRef<AbandonDialogComponent>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
}
