import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { QuestionBankPageComponent } from './question-bank-page.component';

describe('BankQuestionPageComponent', () => {
    let component: QuestionBankPageComponent;
    let fixture: ComponentFixture<QuestionBankPageComponent>;
    let router: Router;

    beforeEach(() => {
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
            ],
        });
        fixture = TestBed.createComponent(QuestionBankPageComponent);
        sessionStorage.setItem('login', 'true');
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to the admin page when the stored login is null', () => {
        const routerSpy = spyOn(router, 'navigate');
        sessionStorage.removeItem('login');
        component.ngOnInit();
        expect(routerSpy).toHaveBeenCalledWith(['/admin']);
    });
});
