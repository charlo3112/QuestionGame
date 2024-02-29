import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { WebSocketService } from '@app/services/websocket.service';
import { ROOM_CODE_LENGTH } from '@common/constants';

@Component({
    selector: 'app-joingame-page',
    templateUrl: './joingame-page.component.html',
    styleUrls: ['./joingame-page.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, NgIf],
})
export class JoinGamePageComponent {
    entryError = false;
    connectForm = new FormGroup({
        code: new FormControl('', [Validators.required, Validators.pattern('[0-9]{4}')]),
        name: new FormControl('', [Validators.required]),
    });

    constructor(private webSocketService: WebSocketService) {}

    async onSubmit() {
        // Validation préalable à l'envoi des données
        if (
            this.connectForm.value.name?.length === 0 ||
            this.connectForm.value.code?.length === 0 ||
            !this.connectForm.value.name ||
            !this.connectForm.value.code
        ) {
            this.entryError = true;
        } else if (this.connectForm.value.code.length !== ROOM_CODE_LENGTH || !Number.isInteger(this.connectForm.value.code)) {
            this.entryError = true;
        } else {
            this.entryError = false;
            this.joinGame();
        }
    }

    joinGame() {
        if (this.connectForm.value.code && this.connectForm.value.name) {
            this.webSocketService.joinRoom(this.connectForm.value.code, this.connectForm.value.name);
        }
    }
}
