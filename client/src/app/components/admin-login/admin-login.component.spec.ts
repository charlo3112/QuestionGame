import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { AdminLoginComponent } from './admin-login.component';
import SpyObj = jasmine.SpyObj;

describe('AdminLoginComponent', () => {
    let component: AdminLoginComponent;
    let fixture: ComponentFixture<AdminLoginComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['login']);
        communicationServiceSpy.login.and.returnValue(of(new HttpResponse<string>({ status: HttpStatusCode.Ok })));

        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, NoopAnimationsModule],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
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
        communicationServiceSpy.login.and.returnValue(of(new HttpResponse<string>({ status: HttpStatusCode.Forbidden })));
        component.loginForm.controls.password.setValue('wrong');
        spyOn(component.loginSuccess, 'emit');
        component.onSubmit();
        expect(component.loginSuccess.emit).not.toHaveBeenCalled();
        expect(component.error).toBeTrue();
    });
});
