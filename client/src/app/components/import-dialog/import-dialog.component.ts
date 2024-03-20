import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { Game } from '@common/interfaces/game';
import { Result } from '@common/interfaces/result';
import { lastValueFrom } from 'rxjs';

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

    async onImport(): Promise<void> {
        if (this.validationErrors.length === 0 && this.data.ok) {
            await this.verifyName(this.data.value.title as string);
            if (this.validName) {
                this.dialogRef.close(this.data.value);
            }
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async verifyAndSetNewName(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement | null;
        if (input) {
            const name = input.value;
            if (this.data.ok) {
                this.data.value.title = name;
            }
            await this.verifyName(name);
        }
    }

    async verifyName(name: string): Promise<void> {
        this.validName = await lastValueFrom(this.communicationService.verifyTitle(name));
    }

    private async loadFile(reader: FileReader): Promise<void> {
        const INVALID_GAME_FORMAT = 'Le format du jeu est invalide.';
        const text = reader.result as string;
        let game;
        this.validationErrors = [INVALID_GAME_FORMAT];
        try {
            game = JSON.parse(text);
        } catch (error) {
            this.validationErrors = [INVALID_GAME_FORMAT];
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
            await this.verifyName(res.value.title as string);
        } else {
            this.validationErrors.push(res.error);
        }
    }
}
