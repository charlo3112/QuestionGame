import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { SNACKBAR_DURATION } from '@common/constants';

@Component({
    selector: 'app-join-game-page',
    templateUrl: './join-game-page.component.html',
    styleUrls: ['./join-game-page.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, RouterModule, FormsModule, ReactiveFormsModule, NgIf],
})
export class JoinGamePageComponent {
    entryError = false;
    connectForm = new FormGroup({
        code: new FormControl('', [Validators.required, Validators.pattern('\\d{4}')]),
        name: new FormControl('', [Validators.required]),
    });

    // eslint-disable-next-line max-params
    constructor(
        private readonly webSocketService: WebSocketService,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
        private readonly sessionStorageService: SessionStorageService,
    ) {}

    async onSubmit() {
        if (this.connectForm.get('code')?.errors || this.connectForm.get('name')?.errors) {
            this.entryError = true;
        } else {
            this.entryError = false;
            await this.joinGame();
        }
    }

    private async joinGame() {
        if (this.connectForm.value.code && this.connectForm.value.name) {
            const res = await this.webSocketService.joinRoom(this.connectForm.value.code, this.connectForm.value.name);
            if (res.ok) {
                const user = { name: this.connectForm.value.name, roomId: this.connectForm.value.code, userId: this.webSocketService.id, play: true };
                this.sessionStorageService.user = user;
                this.router.navigate(['/loading']);
            } else {
                this.snackBar.open(res.error, undefined, {
                    duration: SNACKBAR_DURATION,
                });
            }
        }
    }
}
