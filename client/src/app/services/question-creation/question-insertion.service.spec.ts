import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MIN_NB_OF_POINTS } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';
import { QuestionInsertionService } from './question-insertion.service';

describe('QuestionInsertionService', () => {
    let service: QuestionInsertionService;
    let mockValidQuestion: Question;
    // let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            providers: [QuestionInsertionService, { provide: MatSnackBar, useValue: snackBarSpyObj }],
        });
        service = TestBed.inject(QuestionInsertionService);
        // snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        mockValidQuestion = {
            text: 'Quelle est la capitale du Canada ?',
            points: MIN_NB_OF_POINTS,
            choices: [
                { text: 'Ottawa', isCorrect: true },
                { text: 'Montreal', isCorrect: false },
            ],
            type: QuestionType.QCM,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should insert a question into the questions array', () => {
        const question: Question = mockValidQuestion;
        const questions: Question[] = [];
        service.insertQuestion(question, questions);
        expect(questions.length).toBe(1);
        expect(questions[0]).toEqual(question);
    });

    it('should insert a question from the bank into the questions array', () => {
        const question: Question = mockValidQuestion;
        const isEditingQuestion = false;
        const questions: Question[] = [];
        service.insertQuestionFromBank(question, isEditingQuestion, questions);
        expect(questions.length).toBe(1);
        expect(questions[0]).toEqual(question);
    });

    it('should delete a question', () => {
        const question: Question = mockValidQuestion;
        const questions: Question[] = [question];
        service.deleteQuestion(0, questions);
        expect(questions.length).toBe(0);
    });

    it('should verify if a question is being edited', () => {
        const question: Question = mockValidQuestion;
        const questions: Question[] = [question];
        const isEditingQuestion = false;
        expect(service.verifyQuestion(question, questions, isEditingQuestion)).toBe(false);
    });

    it('should set points to 10 if they are 0', () => {
        const question: Question = {
            text: 'Quelle est la capitale du Canada ?',
            points: 0,
            choices: [
                { text: 'Ottawa', isCorrect: true },
                { text: 'Montreal', isCorrect: false },
            ],
            type: QuestionType.QCM,
        };
        const questions: Question[] = [];
        const isEditingQuestion = false;
        const questionTitleToEdit = '';
        const minimumPoints = 10;

        service.insertQuestionFromCreate(question, isEditingQuestion, questionTitleToEdit, questions);
        expect(question.points).toBe(minimumPoints);
    });
});
