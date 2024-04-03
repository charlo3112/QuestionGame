import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { JoinGamePageComponent } from './joingame-page.component';

describe('JoinGamePageComponent', () => {
    let component: JoinGamePageComponent;
    let fixture: ComponentFixture<JoinGamePageComponent>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let router: Router;
    let location: Location;
    let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;

    beforeEach(() => {
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['joinRoom']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        sessionStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['user']);

        TestBed.configureTestingModule({
            imports: [JoinGamePageComponent, RouterModule.forRoot(routes), BrowserAnimationsModule, NoopAnimationsModule, RouterTestingModule],
            providers: [
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(JoinGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have invalid form when empty', () => {
        expect(component.connectForm.valid).toBeFalsy();
    });

    it('should check form validity', () => {
        const form = component.connectForm;
        expect(form.valid).toBeFalsy();
        form.controls['code'].setValue('1234');
        form.controls['name'].setValue('TestUser');

        expect(form.valid).toBeTruthy();
    });

    it('should display entry error when form is submitted with invalid data', () => {
        expect(component.entryError).toBeFalse();

        component.connectForm.controls['code'].setValue('abc');
        component.onSubmit();

        expect(component.entryError).toBeTrue();
    });

    it('should navigate to loading page on successful join', async () => {
        mockWebSocketService.joinRoom = jasmine.createSpy().and.returnValue(Promise.resolve({ ok: true }));

        component.connectForm.controls['code'].setValue('1234');
        component.connectForm.controls['name'].setValue('TestUser');
        await component.onSubmit();

        expect(location.path()).toBe('/loading');
    });

    it('should display an error snackbar when joinRoom fails', async () => {
        mockWebSocketService.joinRoom = jasmine.createSpy().and.returnValue(Promise.resolve({ ok: false, error: 'Error' }));

        component.connectForm.controls['code'].setValue('1234');
        component.connectForm.controls['name'].setValue('TestUser');
        await component.onSubmit();

        expect(snackBarSpy.open).toHaveBeenCalled();
    });
});
