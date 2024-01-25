import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminGamePreviewComponent } from '@app/components/admin-game-preview/admin-game-preview.component';
import { AdminLoginComponent } from '@app/components/admin-login/admin-login.component';
import { routes } from '@app/modules/app-routing.module';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AdminPageComponent,
                AdminGamePreviewComponent,
                AdminLoginComponent,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                RouterTestingModule,
                RouterLink,
                RouterModule.forRoot(routes),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        router.initialNavigation();
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
        spyOn(component, 'handleLogin');
        const loginComponent = fixture.debugElement.query(By.directive(AdminLoginComponent)).componentInstance;
        loginComponent.loginForm.controls.password.setValue('log2990-202');
        loginComponent.onSubmit();
        expect(component.handleLogin).toHaveBeenCalledWith(true);
    });

    it('login component should not emit loginSuccess event when login is unsuccessful', () => {
        spyOn(component, 'handleLogin');
        const loginComponent = fixture.debugElement.query(By.directive(AdminLoginComponent)).componentInstance;
        loginComponent.loginForm.controls.password.setValue('wrong');
        loginComponent.onSubmit();
        expect(component.handleLogin).not.toHaveBeenCalled();
    });

    it('should emit edit event when edit button is clicked', () => {
        component.login = true;
        component.games = [
            {
                name: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModified: '01-01-2024',
                isVisible: true,
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'editGame');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.edit.emit();
        expect(component.editGame).toHaveBeenCalled();
    });

    it('should emit delete event when delete button is clicked', () => {
        component.login = true;
        component.games = [
            {
                name: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModified: '01-01-2024',
                isVisible: true,
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'deleteGame');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.delete.emit();
        expect(component.deleteGame).toHaveBeenCalled();
    });

    it('should emit export event when export button is clicked', () => {
        component.login = true;
        component.games = [
            {
                name: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModified: '01-01-2024',
                isVisible: true,
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'exportGame');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.export.emit();
        expect(component.exportGame).toHaveBeenCalled();
    });

    it('should emit toggleVisibility event when toggleVisibility button is clicked', () => {
        component.login = true;
        component.games = [
            {
                name: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModified: '01-01-2024',
                isVisible: true,
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'toggleGameVisibility');
        const gamePreview = fixture.debugElement.query(By.directive(AdminGamePreviewComponent));
        gamePreview.componentInstance.toggleVisibility.emit();
        expect(component.toggleGameVisibility).toHaveBeenCalled();
    });
});
