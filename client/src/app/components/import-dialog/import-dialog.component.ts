import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication.service';
import { ValidationService } from '@app/services/validation.service';

type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

@Component({
    selector: 'app-import-dialog',
    templateUrl: './import-dialog.component.html',
    styleUrls: ['./import-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, NgIf, NgFor, MatInputModule],
})
export class ImportDialogComponent {
    validationErrors: string[] = [];
    data: Result<Partial<Game>> = { ok: false, error: '' };
    validName: boolean = false;

    constructor(
        private readonly validationService: ValidationService,
        public dialogRef: MatDialogRef<ImportDialogComponent>,
        private readonly communicationService: CommunicationService,
    ) {}

    onFileSelected(files: FileList): void {
        if (files.length !== 1) {
            return;
        }
        const file = files[0];
        const reader = new FileReader();
        this.validationErrors = [];
        reader.onload = this.loadFile.bind(this, reader);

        reader.readAsText(file);
    }

    onImport(): void {
        if (this.validationErrors.length === 0 && this.data.ok && this.validName) {
            this.dialogRef.close(this.data.value);
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
        this.communicationService.verifyTitle(name).subscribe({
            next: () => {
                this.validName = true;
            },
            error: () => {
                this.validName = false;
            },
        });
    }

    private loadFile(reader: FileReader): void {
        const text = reader.result as string;
        let game;
        this.validationErrors = ['Le format du jeu est invalide.'];
        try {
            game = JSON.parse(text);
        } catch (error) {
            this.validationErrors = ['Le format du jeu est invalide.'];
            return;
        }
        this.validationErrors = this.validationService.validateGame(game);
        if (this.validationErrors.length > 0) {
            this.dialogRef.disableClose = true;
            return;
        }
        const res = this.validationService.filterJSONInput(text);
        if (res.ok) {
            this.data = { ok: true, value: res.value };
            this.verifyName(res.value.title as string);
        } else {
            this.validationErrors.push(res.error);
        }
    }
}
