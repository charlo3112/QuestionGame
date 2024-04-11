import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '@app/modules/material.module';

@Component({
    selector: 'app-abandon-dialog',
    templateUrl: './abandon-dialog.component.html',
    styleUrls: ['./abandon-dialog.component.scss'],
    standalone: true,
    imports: [AppMaterialModule],
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
