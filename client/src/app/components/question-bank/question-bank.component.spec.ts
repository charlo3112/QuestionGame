import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionWithModificationDate } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { QuestionBankComponent } from './question-bank.component';
import { Choice } from '@app/classes/choice';
import { QuestionType } from '@common/constants';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let communicationService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [HttpClientModule],
            providers: [CommunicationService],
        });
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load questions', () => {
        const mockQuestions: QuestionWithModificationDate[] = [
            {
                type: QuestionType.QCM,
                text: 'What is this test number 1?',
                points: 5,
                choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
                lastModification: new Date('2023-09-01T08:10:00.000Z'),
            },
            {
                type: QuestionType.QCM,
                text: 'What is this test number 2?',
                points: 3,
                choices: [new Choice('test', false), new Choice('test2', true), new Choice('test3', true), new Choice('test4', false)],
                lastModification: new Date('2022-03-10T12:30:00.000Z'),
            },
        ];
        const mockResponse: HttpResponse<QuestionWithModificationDate[]> = new HttpResponse({ body: mockQuestions, status: 200, statusText: 'OK' });
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(mockResponse));
        component.loadQuestions();
        expect(component.questions).toEqual(mockQuestions);
    });

    it('should load questions when lastModification is string from JSON', () => {
        const mockQuestion1: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 1?',
            points: 5,
            choices: [new Choice('test', true), new Choice('test2', false), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2023-09-01T08:10:00.000Z'),
        };
        const mockQuestion2: QuestionWithModificationDate = {
            type: QuestionType.QCM,
            text: 'What is this test number 2?',
            points: 3,
            choices: [new Choice('test', false), new Choice('test2', true), new Choice('test3', true), new Choice('test4', false)],
            lastModification: new Date('2022-03-10T12:30:00.000Z'),
        };
        const mockQuestion1JSON = JSON.parse(JSON.stringify(mockQuestion1));
        const mockQuestion2JSON = JSON.parse(JSON.stringify(mockQuestion2));
        const mockQuestions: QuestionWithModificationDate[] = [mockQuestion1JSON, mockQuestion2JSON];
        const mockResponse: HttpResponse<QuestionWithModificationDate[]> = new HttpResponse({ body: mockQuestions, status: 200, statusText: 'OK' });
        spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(of(mockResponse));
        component.loadQuestions();
        expect(component.questions).toEqual(mockQuestions);
    });

    // it('should throw error when getAllQuestionsWithModificationDates fails', () => {
    //     const errorResponse = { status: 404, statusText: 'Not Found' };
    //     spyOn(communicationService, 'getAllQuestionsWithModificationDates').and.returnValue(throwError(() => errorResponse));
    //     expect(() => {
    //         component.loadQuestions();
    //     }).toThrowError('Error fetching questions');
    // });

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
});
