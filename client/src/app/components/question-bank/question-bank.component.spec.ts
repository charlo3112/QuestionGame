import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication/communication.service';
import { QuestionType } from '@common/enums/question-type';
import { QuestionWithModificationDate } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';
import { of, throwError } from 'rxjs';
import { QuestionBankComponent } from './question-bank.component';

class MatSnackBarStub {
    open() {
        return;
    }
}

const mockQuestion: QuestionWithModificationDate = {
    type: QuestionType.QCM,
    text: 'What is this test number 1?',
    points: 5,
    choices: [
        { text: 'test', isCorrect: true },
        { text: 'test2', isCorrect: false },
        { text: 'test3', isCorrect: true },
        { text: 'test4', isCorrect: false },
    ],
    lastModification: new Date('2023-09-01T08:10:00.000Z'),
    mongoId: '123',
};

const mockQuestions: QuestionWithModificationDate[] = [
    {
        type: QuestionType.QCM,
        text: 'What is this test number 1?',
        points: 5,
        choices: [
            { text: 'test', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: true },
            { text: 'test4', isCorrect: false },
        ],
        lastModification: new Date('2023-09-01T08:10:00.000Z'),
        mongoId: '123',
    },
    {
        type: QuestionType.QCM,
        text: 'What is this test number 2?',
        points: 3,
        choices: [
            { text: 'test', isCorrect: false },
            { text: 'test2', isCorrect: true },
            { text: 'test3', isCorrect: true },
            { text: 'test4', isCorrect: false },
        ],
        lastModification: new Date('2022-03-10T12:30:00.000Z'),
        mongoId: '456',
    },
];

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let communicationService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [HttpClientModule, NoopAnimationsModule],
            providers: [CommunicationService, { provide: MatSnackBar, useClass: MatSnackBarStub }],
        });
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load questions', fakeAsync(() => {
        const mockResponse: Result<QuestionWithModificationDate[]> = { ok: true, value: mockQuestions };
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(mockResponse));
        component.loadQuestions();
        tick();
        expect(component.questions).toEqual(mockQuestions);
    }));

    it('should throw error when getAllQuestionsWithModificationDates return error', fakeAsync(() => {
        const errorResponse = { ok: false, error: 'Error fetching questions' } as Result<QuestionWithModificationDate[]>;
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(errorResponse));
        expect(() => {
            component.loadQuestions();
            tick();
        }).toThrowError('Erreur lors de la récupération des questions');
    }));

    it('should throw error when getAllQuestionsWithModificationDates fails', fakeAsync(() => {
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(throwError(() => 'errorResponse'));
        expect(() => {
            component.loadQuestions();
            tick();
        }).toThrowError('Erreur lors de la récupération des questions');
    }));

    it('should load questions when lastModification is string from JSON', fakeAsync(() => {
        const mockResponse: Result<QuestionWithModificationDate[]> = { ok: true, value: mockQuestions };
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(mockResponse));
        component.loadQuestions();
        tick();
        expect(component.questions).toEqual(mockQuestions);
    }));

    it('should calculate time correctly for recent modification', () => {
        const recentModificationDate = new Date();
        const expectedResult = `${recentModificationDate.getHours().toString().padStart(2, '0')}:${recentModificationDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
        const result = component.calculateTime(recentModificationDate);
        expect(result).toEqual(expectedResult);
    });

    it('should calculate time correctly for older modification', () => {
        const olderModificationDate = new Date('2020-01-01T12:00:00.000Z');
        const expectedResult = '2020-01-01';
        const result = component.calculateTime(olderModificationDate);
        expect(result).toEqual(expectedResult);
    });

    it('toggleHighlight should highlight the selected question', () => {
        component.toggleHighlight(mockQuestion);
        expect(component.highlightedQuestion).toEqual(mockQuestion);
    });

    it('deleteQuestion should delete the selected question', fakeAsync(() => {
        component.questions = [mockQuestion];
        spyOn(communicationService, 'deleteQuestion').and.returnValue(of({} as HttpResponse<string>));
        component.deleteQuestion(mockQuestion.mongoId);
        tick();
        expect(component.questions).toEqual([]);
    }));

    it('should throw error when deleteQuestion fails', fakeAsync(() => {
        component.questions = [];
        spyOn(communicationService, 'deleteQuestion').and.returnValue(throwError(() => 'errorResponse'));
        expect(() => {
            component.deleteQuestion(mockQuestion.mongoId);
            tick();
        }).toThrowError('Error deleting question');
    }));

    it('should toggleHighlight when the selected question is already highlighted', () => {
        component.highlightedQuestion = mockQuestion;
        component.toggleHighlight(mockQuestion);
        expect(component.highlightedQuestion).toBeNull();
    });

    it('should warn the user if a question is not highlighted', () => {
        component.highlightedQuestion = null;
        fixture.detectChanges();
        spyOn(component['snackBar'], 'open');
        component.sendQuestion();
        expect(component['snackBar'].open).toHaveBeenCalled();
    });

    it('should send the selected question', () => {
        component.insertQuestion(mockQuestion);
        component.editQuestion(mockQuestion);
        component.insertQuestion(mockQuestion);
        fixture.detectChanges();
        spyOn(component.sendQuestionSelected, 'emit');
        component.sendQuestion();
        expect(component.sendQuestionSelected.emit).toHaveBeenCalled();
    });

    it('should close the form when the question is sent', () => {
        spyOn(component.closeAdd, 'emit');
        spyOn(component, 'loadQuestions');
        component.closeCreateQuestion();
        expect(component.closeAdd.emit).toHaveBeenCalled();
        expect(component.loadQuestions).toHaveBeenCalled();
    });

    it('should close the form when closeQuestionBank is called', () => {
        spyOn(component.formClosed, 'emit');
        component.closeQuestionBank();
        expect(component.formClosed.emit).toHaveBeenCalled();
    });

    describe('filterQuestionsByType', () => {
        it('should return all questions if type is All', () => {
            component.selectedSort = 'All';
            component.questions = mockQuestions;
            component.filterQuestionsByType();
            expect(component.questions).toEqual(mockQuestions);
        });

        it('should return only QCM questions if type is QCM', () => {
            component.selectedSort = 'QRL';
            component.questions = mockQuestions;
            component.filterQuestionsByType();
            expect(component.questions[0]).toEqual(mockQuestions[0]);
        });
    });
});
