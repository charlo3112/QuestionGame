import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-admin-upload',
    templateUrl: './admin-upload.component.html',
    styleUrls: ['./admin-upload.component.scss'],
    standalone: true,
    imports: [MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule, NgIf],
})
export class AdminUploadComponent {
    fileContent: unknown = null;
    fileName: string = '';
    newName: string = '';
    nameTaken: boolean = false;

    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        // const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
        //     data: { name: this.name, animal: this.animal },
        // });
        // dialogRef.afterClosed().subscribe((result) => {
        //     console.log('The dialog was closed');
        //     this.animal = result;
        // });
    }

    onFileSelected(): void {
        // const file = (event.target as HTMLInputElement).files[0];
        // if (file) {
        //     this.fileName = file.name;
        //     const reader = new FileReader();
        //     reader.onload = (e) => {
        //         try {
        //             this.fileContent = JSON.parse(reader.result as string);
        //             // Ici, vous pouvez vérifier si le nom est pris et ajuster `nameTaken` en conséquence
        //             // this.nameTaken = this.checkIfNameTaken(this.fileContent.name);
        //         } catch (error) {
        //             console.error('Erreur lors de la lecture du fichier JSON:', error);
        //         }
        //     };
        //     reader.readAsText(file);
        // }
        alert('Not implemented');
    }

    validate(): void {
        if (this.nameTaken) {
            // Ici, enregistrez le nouveau nom si nécessaire
            // console.log('Nouveau nom:', this.newName);
        }
        // Autres validations...
        this.closeMenu();
    }

    closeMenu(): void {
        // Fermer le menu/dialogue
    }
}
