import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { AdminService } from '@app/services/admin/admin.service';
import { QuestionBankPageComponent } from './question-bank-page.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionBankPageComponent', () => {
    let component: QuestionBankPageComponent;
    let fixture: ComponentFixture<QuestionBankPageComponent>;
    let router: Router;
    let adminServiceSpy: SpyObj<AdminService>;
    let mockLogin: boolean;

    beforeEach(() => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', ['login']);
        Object.defineProperty(adminServiceSpy, 'login', { get: () => mockLogin });
        TestBed.configureTestingModule({
            imports: [
                QuestionBankPageComponent,
                QuestionBankComponent,
                MatToolbarModule,
                MatButtonModule,
                RouterTestingModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                HttpClientModule,
                MatSnackBarModule,
            ],
            providers: [{ provide: AdminService, useValue: adminServiceSpy }],
        });
        fixture = TestBed.createComponent(QuestionBankPageComponent);
        mockLogin = true;
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to the admin page when the stored login is null', () => {
        const routerSpy = spyOn(router, 'navigate');
        mockLogin = false;
        component.ngOnInit();
        expect(routerSpy).toHaveBeenCalledWith(['/admin']);
    });

    it('when handleCloseAdd() is called, should put showAddQuestion to false', () => {
        component.showAddQuestion = true;
        component.handleCloseAdd();
        expect(component.showAddQuestion).toBeFalse();
    });

    it('when handleCreateQuestion() is called, should put showAddQuestion to true and call child.toggleHighlight(null)', () => {
        component.showAddQuestion = false;
        component.handleCreateQuestion();
        expect(component.showAddQuestion).toBeTrue();
    });
});
