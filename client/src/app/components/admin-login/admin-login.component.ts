import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommunicationService } from '@app/services//communication/communication.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-login',
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatInputModule, MatIconModule, FormsModule, ReactiveFormsModule, NgIf],
})
export class AdminLoginComponent {
    @Output() loginSuccess = new EventEmitter<boolean>();
    error = false;

    loginForm = new FormGroup({
        password: new FormControl('', [Validators.required]),
    });

    constructor(private readonly communicationService: CommunicationService) {}
    async onSubmit() {
        if (this.loginForm.value.password) {
            const response = await lastValueFrom(this.communicationService.login(this.loginForm.value.password));
            if (response) {
                this.error = false;
                this.loginSuccess.emit(true);
            } else {
                this.error = true;
            }
        }
    }
}
