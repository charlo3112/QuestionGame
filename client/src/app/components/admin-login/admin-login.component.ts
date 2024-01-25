import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-admin-login',
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
    @Output() loginSuccess = new EventEmitter<boolean>();

    loginForm = new FormGroup({
        password: new FormControl('', [Validators.required]),
    });

    onSubmit() {
        if (this.loginForm.valid) {
            if (this.loginForm.value.password === 'admin') {
                this.loginSuccess.emit(true);
            }
        }
    }
}
