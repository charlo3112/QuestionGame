import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '@app/modules/material.module';

@Component({
    selector: 'app-erase-history-dialog',
    templateUrl: './erase-history-dialog.component.html',
    styleUrls: ['./erase-history-dialog.component.scss'],
    standalone: true,
    imports: [AppMaterialModule],
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
