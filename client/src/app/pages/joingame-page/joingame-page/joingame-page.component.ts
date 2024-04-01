import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { SNACKBAR_DURATION } from '@common/constants';

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
        code: new FormControl('', [Validators.required, Validators.pattern('\\d{4}')]),
        name: new FormControl('', [Validators.required]),
    });

    constructor(
        private webSocketService: WebSocketService,
        private snackBar: MatSnackBar,
        private router: Router,
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
                sessionStorage.setItem('user', JSON.stringify(user));
                this.router.navigate(['/loading']);
            } else {
                this.snackBar.open(res.error, undefined, {
                    duration: SNACKBAR_DURATION,
                });
            }
        }
    }
}
