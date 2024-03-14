import { HttpClientModule, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminGamePreviewComponent } from '@app/components/admin-game-preview/admin-game-preview.component';
import { AdminLoginComponent } from '@app/components/admin-login/admin-login.component';
import { GAME_PLACEHOLDER, Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { Result } from '@common/result';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import SpyObj = jasmine.SpyObj;

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let snackBarSpy: SpyObj<MatSnackBar>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', [
            'deleteGame',
            'toggleGameVisibility',
            'exportGame',
            'getAdminGames',
            'login',
            'exportGame',
            'addGame',
        ]);
        communicationServiceSpy.deleteGame.and.returnValue(of(new HttpResponse<string>({ status: HttpStatusCode.Ok })));
        communicationServiceSpy.toggleGameVisibility.and.returnValue(
            of(new HttpResponse<string>({ status: HttpStatusCode.Ok, body: '{"visibility": false}' })),
        );
        communicationServiceSpy.exportGame.and.returnValue(of(new HttpResponse<string>({ status: HttpStatusCode.Ok, body: '' })));
        communicationServiceSpy.getAdminGames.and.returnValue(of({ ok: true, value: [GAME_PLACEHOLDER] } as Result<Game[]>));
        communicationServiceSpy.login.and.returnValue(of(true));
        communicationServiceSpy.exportGame.and.returnValue(
            of(new HttpResponse<string>({ status: HttpStatusCode.Ok, body: JSON.stringify(GAME_PLACEHOLDER) })),
        );
        communicationServiceSpy.addGame.and.returnValue(of(new HttpResponse<string>({ status: HttpStatusCode.Ok })));

        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.overrideProvider(MatDialog, {
            useValue: {
                open: () => ({
                    afterClosed: () => of(GAME_PLACEHOLDER), // Simulate dialog closing with a result
                }),
            },
        });

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

    it('should show snackbar when error occurs during loadGames', fakeAsync(() => {
        communicationServiceSpy.getAdminGames.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        spyOn(component, 'openSnackBar');
        component.loadGames();
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should show snackbar when loadGames is called and is not ok', fakeAsync(() => {
        communicationServiceSpy.getAdminGames.and.returnValue(of({ ok: false } as Result<Game[]>));
        spyOn(component, 'openSnackBar');
        component.loadGames();
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

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

    it('should display game previews when already logged in', () => {
        sessionStorage.setItem('login', 'true');
        component.ngOnInit();
        expect(component.login).toBeTrue();
    });

    it('should handle login', () => {
        component.handleLogin(true);
        expect(component.login).toBeTrue();
    });

    it('login component should emit loginSuccess event when login is successful', fakeAsync(() => {
        component.login = false;
        fixture.detectChanges();
        spyOn(component, 'handleLogin');
        const loginComponent = fixture.debugElement.query(By.directive(AdminLoginComponent)).componentInstance;
        loginComponent.loginForm.controls.password.setValue('log2990-202');
        loginComponent.onSubmit();
        tick();
        expect(component.handleLogin).toHaveBeenCalledWith(true);
    }));

    it('login component should not emit loginSuccess event when login is unsuccessful', () => {
        communicationServiceSpy.login.and.returnValue(of(false));
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
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();
        spyOn(component, 'deleteGame');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.delete.emit();
        expect(component.deleteGame).toHaveBeenCalled();
    });

    it('should delete game when deleteGame is called', fakeAsync(() => {
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();

        component.deleteGame(GAME_PLACEHOLDER.gameId);
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
        component.deleteGame(GAME_PLACEHOLDER.gameId);
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should open snackbar when openSnackBar is called', () => {
        spyOn(component['snackBar'], 'open');
        component.openSnackBar('message');
        expect(component['snackBar'].open).toHaveBeenCalledWith('message', undefined, { duration: SNACKBAR_DURATION });
    });

    it('should emit export event when export button is clicked', () => {
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();
        spyOn(component, 'exportGame');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.export.emit();
        expect(component.exportGame).toHaveBeenCalled();
    });

    it('should export game when exportGame is called', fakeAsync(() => {
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.exportGame(GAME_PLACEHOLDER.gameId);
        tick();
        expect(component.openSnackBar).not.toHaveBeenCalled();
    }));

    it('should show snackbar when exportGame is called and error occurs', fakeAsync(() => {
        communicationServiceSpy.exportGame.and.returnValue(
            throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })),
        );
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.exportGame(GAME_PLACEHOLDER.gameId);
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should should show snackbar when exportGame is called and no data is received', fakeAsync(() => {
        communicationServiceSpy.exportGame.and.returnValue(of(new HttpResponse<string>({ status: 404 })));
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.exportGame(GAME_PLACEHOLDER.gameId);
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should emit toggleVisibility event when toggleVisibility button is clicked', () => {
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();
        spyOn(component, 'toggleGameVisibility');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.toggleVisibility.emit();
        expect(component.toggleGameVisibility).toHaveBeenCalled();
    });

    it('should toggle game visibility when toggleGameVisibility is called', fakeAsync(() => {
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();

        component.toggleGameVisibility(GAME_PLACEHOLDER.gameId);
        tick();
        fixture.detectChanges();
        expect(component.games[0].visibility).toBeFalse();
        expect(snackBarSpy.open).not.toHaveBeenCalled();
    }));

    it('should not toogle game visibility when toggleGameVisibility is called with invalid id', fakeAsync(() => {
        component.login = true;
        component.games = [{ ...GAME_PLACEHOLDER }];
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
        component.games = [{ ...GAME_PLACEHOLDER }];
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.toggleGameVisibility(GAME_PLACEHOLDER.gameId);
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
        fixture.detectChanges();
        expect(component.games).toEqual([]);
    }));

    it('should open dialog when upload button is clicked', fakeAsync(() => {
        component.login = true;
        fixture.detectChanges();
        spyOn(component, 'openImportDialog').and.callThrough();
        spyOn(component, 'openSnackBar');
        component.openImportDialog();
        tick();
        expect(communicationServiceSpy.addGame).toHaveBeenCalledWith(GAME_PLACEHOLDER);
        expect(component.openSnackBar).toHaveBeenCalledWith('Game added');
    }));

    it('should show snackbar when openImportDialog is called and error occurs', fakeAsync(() => {
        communicationServiceSpy.addGame.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        component.login = true;
        fixture.detectChanges();
        spyOn(component, 'openSnackBar');
        component.openImportDialog();
        tick();
        expect(component.openSnackBar).toHaveBeenCalledWith('Error adding game');
    }));
});
