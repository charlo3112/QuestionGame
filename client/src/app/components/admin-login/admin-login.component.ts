import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services//communication/communication.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-login',
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, FormsModule, ReactiveFormsModule, NgIf],
})
export class AdminLoginComponent {
    @Output() loginSuccess = new EventEmitter<boolean>();
    error = false;

    loginForm = new FormGroup({
        password: new FormControl('', [Validators.required]),
    });

    constructor(private readonly communicationService: CommunicationService) {}
    async onSubmit(): Promise<void> {
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
