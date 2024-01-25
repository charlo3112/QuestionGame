import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminLoginComponent } from './admin-login.component';

describe('AdminLoginComponent', () => {
    let component: AdminLoginComponent;
    let fixture: ComponentFixture<AdminLoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, NoopAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminLoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#onSubmit should emit true if password is correct', () => {
        component.loginForm.controls.password.setValue('log2990-202');
        spyOn(component.loginSuccess, 'emit');
        component.onSubmit();
        expect(component.loginSuccess.emit).toHaveBeenCalledWith(true);
    });

    it('#onSubmit should not emit if password is incorrect', () => {
        component.loginForm.controls.password.setValue('wrong');
        spyOn(component.loginSuccess, 'emit');
        component.onSubmit();
        expect(component.loginSuccess.emit).not.toHaveBeenCalled();
        expect(component.error).toBeTrue();
    });
});
