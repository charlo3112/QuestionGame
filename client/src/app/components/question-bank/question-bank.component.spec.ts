// import { HttpClientModule, HttpResponse } from '@angular/common/http';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Question, QuestionType } from '@app/interfaces/question';
// import { CommunicationService } from '@app/services/communication.service';
// import { of } from 'rxjs';
// import { QuestionBankComponent } from './question-bank.component';

// describe('QuestionBankComponent', () => {
//     let component: QuestionBankComponent;
//     let fixture: ComponentFixture<QuestionBankComponent>;
//     let communicationService: CommunicationService;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             declarations: [],
//             imports: [HttpClientModule],
//             providers: [CommunicationService],
//         });
//         fixture = TestBed.createComponent(QuestionBankComponent);
//         component = fixture.componentInstance;
//         communicationService = TestBed.inject(CommunicationService);
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should load questions', () => {
//         const mockQuestions: Question[] = [
//             {
//                 type: QuestionType.Qcm,
//                 text: 'What is this test number 1?',
//                 points: 5,
//                 choices: [{ text: 'test', isCorrect: true }, { text: 'test2' }, { text: 'test3', isCorrect: true }, { text: 'test4' }],
//                 lastModification: new Date('2023-09-01T08:10:00.000Z'),
//             },
//             {
//                 type: QuestionType.Qcm,
//                 text: 'What is this test number 2?',
//                 points: 3,
//                 choices: [{ text: 'test' }, { text: 'test2', isCorrect: true }, { text: 'test3', isCorrect: true }, { text: 'test4' }],
//                 lastModification: new Date('2022-03-10T12:30:00.000Z'),
//             },
//         ];
//         const mockResponse1: HttpResponse<Question[]> = new HttpResponse({ body: mockQuestions, status: 200, statusText: 'OK' });
//         spyOn(communicationService, 'getAllQuestions').and.returnValue(of(mockResponse1));
//         component.loadQuestions();
//         expect(component.questions).toEqual(mockQuestions);
//         expect(component.errorLoadingQuestions).toBeFalse();
//     });
// });
