import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { GameType } from '@app/pages/startgame-page/startgame-page.component';

@Component({
    selector: 'app-start-game-dialog',
    templateUrl: './start-game-dialog.component.html',
    standalone: true,
    styleUrls: ['./start-game-dialog.component.scss'],
    imports: [MatButtonModule, RouterModule],
})
export class StartGameDialogComponent implements OnInit {
    localgame: GameType;
    constructor(
        public dialogRef: MatDialogRef<StartGameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public gameObject: { gameObject: GameType },
    ) {}

    ngOnInit(): void {
        this.localgame = this.gameObject.gameObject;
    }
    startGame(): void {
        // TODO : Needs to link to waiting page and start game
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    openTest(): void {
        // TODO: Allow user to test
    }
}
