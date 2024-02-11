import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionBankComponent } from './question-bank.component';
}

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let communicationService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionBankComponent],
        });
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load questions', () => {
        const mockQuestions = [
            { id: 1, lastModification: '2024-02-10T10:00:00' },
            { id: 2, lastModification: '2024-02-09T08:00:00' },
        ];
        spyOn(communicationService, 'getAllQuestions').and.returnValue(of({ body: mockQuestions }));
        component.loadQuestions();
        expect(component.questions).toBeTruthy();
    });
});
