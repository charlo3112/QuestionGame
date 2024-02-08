import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Game } from '@app/interfaces/game';
import { GameValidationService } from '@app/services/game-validation.service';

type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

@Component({
    selector: 'app-import-dialog',
    templateUrl: './import-dialog.component.html',
    styleUrls: ['./import-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, NgIf, NgFor],
    providers: [GameValidationService],
})
export class ImportDialogComponent {
    validationErrors: string[] = [];
    data: Result<Partial<Game>> = { ok: false, error: '' };
    validName: boolean = false;

    constructor(
        private validationService: GameValidationService,
        public dialogRef: MatDialogRef<ImportDialogComponent>,
    ) {}

    onFileSelected(files: FileList): void {
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const text = reader.result as string;
                this.validationErrors = this.validationService.validateGame(text);
                if (this.validationErrors.length > 0) {
                    this.dialogRef.disableClose = true;
                } else {
                    const res = this.validationService.filterJSONInput(text);
                    if (res.ok) {
                        this.data = { ok: true, value: res.value };
                        this.verifyName(res.value.title as string);
                    } else {
                        this.validationErrors.push(res.error);
                    }
                }
            };

            reader.readAsText(file);
        }
    }

    onImport(): void {
        if (this.validationErrors.length === 0 && this.data.ok && this.validName) {
            this.dialogRef.close(this.data);
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    verifyAndSetNewName(event: Event): void {
        const input = event.target as HTMLInputElement | null;
        if (input) {
            const name = input.value;
            if (this.data.ok) {
                this.data.value.title = name;
            }
            this.verifyName(name);
        }
    }

    verifyName(name: string): void {
        if (name === 'test') {
            this.validName = true;
        }
    }
}
