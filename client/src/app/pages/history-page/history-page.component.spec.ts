import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { AdminService } from '@app/services/admin/admin.service';
import { HistoryPageComponent } from './history-page.component';

describe('HistoryPageComponent', () => {
    let component: HistoryPageComponent;
    let fixture: ComponentFixture<HistoryPageComponent>;
    let adminServiceSpy: jasmine.SpyObj<AdminService>;
    let router: Router;

    let mockLogin: boolean;

    beforeEach(() => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', ['login']);
        Object.defineProperty(adminServiceSpy, 'login', { get: () => mockLogin });
        mockLogin = false;

        TestBed.configureTestingModule({
            imports: [
                HistoryPageComponent,
                RouterTestingModule,
                HttpClientTestingModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                RouterModule.forRoot(routes),
                MatDialogModule,
            ],
            providers: [{ provide: AdminService, useValue: adminServiceSpy }],
        });
        fixture = TestBed.createComponent(HistoryPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        router.initialNavigation();
        spyOn(router, 'navigate');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should redirect to admin page if not logged in', () => {
        component.ngOnInit();
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should not redirect to admin page if logged in', () => {
        mockLogin = true;
        component.ngOnInit();
        expect(router.navigate).not.toHaveBeenCalledWith(['/admin']);
    });
});
