import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Choice } from '@app/classes/choice';
import { QuestionWithModificationDate } from '@app/interfaces/question';
import { Result } from '@app/interfaces/result';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionType } from '@common/constants';
import { of, throwError } from 'rxjs';
import { QuestionBankComponent } from './question-bank.component';
import { MatSnackBar } from '@angular/material/snack-bar';

class MatSnackBarStub {
    open() {
        return;
    }
}

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let communicationService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [HttpClientModule],
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
        const mockQuestions: QuestionWithModificationDate[] = [
            {
                type: QuestionType.QCM,
                text: 'What is this test number 1?',
                points: 5,
                choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
                lastModification: new Date('2023-09-01T08:10:00.000Z'),
                mongoId: '123',
            },
            {
                type: QuestionType.QCM,
                text: 'What is this test number 2?',
                points: 3,
                choices: [new Choice('test', false), new Choice('test2', true), new Choice('test3', true), new Choice('test4', false)],
                lastModification: new Date('2022-03-10T12:30:00.000Z'),
                mongoId: '456',
            },
        ];
        const mockResponse: Result<QuestionWithModificationDate[]> = { ok: true, value: mockQuestions };
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(mockResponse));
        component.loadQuestions();
        tick();
        expect(component.questionsWithModificationDate).toEqual(mockQuestions);
    }));

    it('should throw error when getAllQuestionsWithModificationDates return error', fakeAsync(() => {
        const errorResponse = { ok: false, error: 'Error fetching questions' } as Result<QuestionWithModificationDate[]>;
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(errorResponse));
        expect(() => {
            component.loadQuestions();
            tick();
        }).toThrowError('Error fetching questions');
    }));

    it('should throw error when getAllQuestionsWithModificationDates fails', fakeAsync(() => {
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(throwError(() => 'errorResponse'));
        expect(() => {
            component.loadQuestions();
            tick();
        }).toThrowError('Error fetching questions');
    }));

    it('should load questions when lastModification is string from JSON', fakeAsync(() => {
        const mockQuestion1: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 1?',
            points: 5,
            choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2023-09-01T08:10:00.000Z'),
            mongoId: '123',
        };
        const mockQuestion2: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 2?',
            points: 3,
            choices: [new Choice('test', false), new Choice('test2', true), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2022-03-10T12:30:00.000Z'),
            mongoId: '456',
        };
        const mockQuestion1JSON = JSON.parse(JSON.stringify(mockQuestion1));
        const mockQuestion2JSON = JSON.parse(JSON.stringify(mockQuestion2));
        const mockQuestions: QuestionWithModificationDate[] = [mockQuestion1JSON, mockQuestion2JSON];
        const mockResponse: Result<QuestionWithModificationDate[]> = { ok: true, value: mockQuestions };
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(mockResponse));
        component.loadQuestions();
        tick();
        expect(component.questionsWithModificationDate).toEqual(mockQuestions);
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
        const mockQuestion: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 1?',
            points: 5,
            choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2023-09-01T08:10:00.000Z'),
            mongoId: '123',
        };
        component.toggleHighlight(mockQuestion);
        expect(component.highlightedQuestion).toEqual(mockQuestion);
    });

    it('deleteQuestion should delete the selected question', fakeAsync(() => {
        const mockQuestion: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 1?',
            points: 5,
            choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2023-09-01T08:10:00.000Z'),
            mongoId: '123',
        };
        const mockQuestions: QuestionWithModificationDate[] = [mockQuestion];
        component.questionsWithModificationDate = mockQuestions;
        spyOn(communicationService, 'deleteQuestion').and.returnValue(of({} as HttpResponse<string>));
        component.deleteQuestion(mockQuestion.mongoId);
        tick();
        expect(component.questionsWithModificationDate).toEqual([]);
    }));

    it('should throw error when deleteQuestion fails', fakeAsync(() => {
        const mockQuestion: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 1?',
            points: 5,
            choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2023-09-01T08:10:00.000Z'),
            mongoId: '123',
        };
        const mockQuestions: QuestionWithModificationDate[] = [mockQuestion];
        component.questionsWithModificationDate = mockQuestions;
        spyOn(communicationService, 'deleteQuestion').and.returnValue(throwError(() => 'errorResponse'));
        expect(() => {
            component.deleteQuestion(mockQuestion.mongoId);
            tick();
        }).toThrowError('Error deleting question');
    }));

    it('should toggleHighlight when the selected question is already highlighted', () => {
        const mockQuestion: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 1?',
            points: 5,
            choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2023-09-01T08:10:00.000Z'),
            mongoId: '123',
        };
        component.highlightedQuestion = mockQuestion;
        component.toggleHighlight(mockQuestion);
        expect(component.highlightedQuestion).toEqual(null as unknown as QuestionWithModificationDate);
    });
});
