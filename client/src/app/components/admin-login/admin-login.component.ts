import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

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

    onSubmit() {
        if (this.loginForm.valid) {
            if (this.loginForm.value.password === 'log2990-202') {
                this.loginSuccess.emit(true);
            } else {
                this.error = true;
                this.loginForm.reset();
            }
        }
    }
}
