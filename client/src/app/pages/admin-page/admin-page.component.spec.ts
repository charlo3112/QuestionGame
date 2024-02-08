import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminGamePreviewComponent } from '@app/components/admin-game-preview/admin-game-preview.component';
import { AdminLoginComponent } from '@app/components/admin-login/admin-login.component';
import { CommunicationService } from '@app/services/communication.service';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import SpyObj = jasmine.SpyObj;

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let snackBarSpy: SpyObj<MatSnackBar>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['deleteGame', 'toggleGameVisibility', 'exportGame']);
        communicationServiceSpy.deleteGame.and.returnValue(of(new HttpResponse<string>({ status: 200 })));
        communicationServiceSpy.toggleGameVisibility.and.returnValue(of(new HttpResponse<string>({ status: 200 })));
        communicationServiceSpy.exportGame.and.returnValue(
            of(new HttpResponse<Blob>({ status: 200, body: new Blob([JSON.stringify({})], { type: 'application/json' }) })),
        );

        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [
                AdminPageComponent,
                AdminGamePreviewComponent,
                AdminLoginComponent,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                HttpClientModule,
                RouterTestingModule,
            ],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminPageComponent);
        spyOn(URL, 'createObjectURL').and.returnValue('mock-object-url');
        spyOn(URL, 'revokeObjectURL');
        sessionStorage.removeItem('login');
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display login component when not logged in', () => {
        component.login = false;
        fixture.detectChanges();
        const loginComponent = fixture.debugElement.query(By.directive(AdminLoginComponent));
        expect(loginComponent).toBeTruthy();
    });

    it('should display game previews when logged in', () => {
        component.login = true;
        fixture.detectChanges();
        const gamePreviews = fixture.debugElement.queryAll(By.directive(AdminGamePreviewComponent));
        expect(gamePreviews.length).toBe(component.games.length);
    });

    it('should handle login', () => {
        component.handleLogin(true);
        expect(component.login).toBeTrue();
    });

    it('login component should emit loginSuccess event when login is successful', () => {
        component.login = false;
        fixture.detectChanges();
        spyOn(component, 'handleLogin');
        const loginComponent = fixture.debugElement.query(By.directive(AdminLoginComponent)).componentInstance;
        loginComponent.loginForm.controls.password.setValue('log2990-202');
        loginComponent.onSubmit();
        expect(component.handleLogin).toHaveBeenCalledWith(true);
    });

    it('login component should not emit loginSuccess event when login is unsuccessful', () => {
        component.login = false;
        fixture.detectChanges();
        spyOn(component, 'handleLogin');
        const loginComponent = fixture.debugElement.query(By.directive(AdminLoginComponent)).componentInstance;
        loginComponent.loginForm.controls.password.setValue('wrong');
        loginComponent.onSubmit();
        expect(component.handleLogin).not.toHaveBeenCalled();
    });

    it('should emit delete event when delete button is clicked', () => {
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                lastModification: '01-01-2024',
                isVisible: true,
                image: '#',
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'deleteGame');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.delete.emit();
        expect(component.deleteGame).toHaveBeenCalled();
    });

    it('should delete game when deleteGame is called', fakeAsync(() => {
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                lastModification: '01-01-2024',
                isVisible: true,
                image: '#',
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();

        component.deleteGame('test-game');
        tick();
        fixture.detectChanges();
        expect(component.games.length).toBe(0);
        expect(snackBarSpy.open).not.toHaveBeenCalled();
    }));

    it('should delete game show snackbar when deleteGame is called and error occurs', fakeAsync(() => {
        communicationServiceSpy.deleteGame.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

        component.login = true;
        component.games = [];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.deleteGame('test-game');
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should open snackbar when openSnackBar is called', () => {
        spyOn(component['snackBar'], 'open');
        component.openSnackBar('message', 'action');
        expect(component['snackBar'].open).toHaveBeenCalledWith('message', 'action');
    });

    it('should emit export event when export button is clicked', () => {
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'exportGame');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.export.emit();
        expect(component.exportGame).toHaveBeenCalled();
    });

    it('should export game when exportGame is called', fakeAsync(() => {
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.exportGame('test-game');
        tick();
        expect(component.openSnackBar).not.toHaveBeenCalled();
    }));

    it('should show snackbar when exportGame is called and error occurs', fakeAsync(() => {
        communicationServiceSpy.exportGame.and.returnValue(
            throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })),
        );
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.exportGame('test-game');
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should should show snackbar when exportGame is called and no data is received', fakeAsync(() => {
        communicationServiceSpy.exportGame.and.returnValue(of(new HttpResponse<Blob>({ status: 404 })));
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.exportGame('test-game');
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should emit toggleVisibility event when toggleVisibility button is clicked', () => {
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'toggleGameVisibility');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.toggleVisibility.emit();
        expect(component.toggleGameVisibility).toHaveBeenCalled();
    });

    it('should toggle game visibility when toggleGameVisibility is called', fakeAsync(() => {
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();

        component.toggleGameVisibility('test-game');
        tick();
        fixture.detectChanges();
        expect(component.games[0].isVisible).toBeFalse();
        expect(snackBarSpy.open).not.toHaveBeenCalled();
    }));

    it('should not toogle game visibility when toggleGameVisibility is called with invalid id', fakeAsync(() => {
        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();

        component.toggleGameVisibility('none');
        tick();
        fixture.detectChanges();
        expect(component.games).toEqual(component.games);
        expect(snackBarSpy.open).not.toHaveBeenCalled();
    }));

    it('should show snackbar when toggleGameVisibility is called and error occurs', fakeAsync(() => {
        communicationServiceSpy.toggleGameVisibility.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

        component.login = true;
        component.games = [
            {
                title: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModification: '01-01-2024',
                isVisible: true,
                duration: 0,
                questions: [],
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.toggleGameVisibility('test-game');
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
        fixture.detectChanges();
        expect(component.games).toEqual([]); // delete game from list if not found
    }));
});
