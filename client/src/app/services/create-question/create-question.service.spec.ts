import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Choice } from '@app/classes/choice';
import { Question, QuestionWithModificationDate } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication/communication.service';
import { QuestionType, RESPONSE_CREATED, SNACKBAR_DURATION } from '@common/constants';
import { of, throwError } from 'rxjs';
import { CreateQuestionService } from './create-question.service';
import SpyObj = jasmine.SpyObj;

describe('CreateQuestionService', () => {
    let createQuestionService: CreateQuestionService;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let snackBarSpy: SpyObj<MatSnackBar>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['addQuestion', 'modifyQuestion']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });
        createQuestionService = TestBed.inject(CreateQuestionService);
    });

    it('should be created', () => {
        expect(createQuestionService).toBeTruthy();
    });

    it('should open snackbar', () => {
        const message = 'Test message';
        const duration = SNACKBAR_DURATION;
        createQuestionService.openSnackBar(message);
        expect(snackBarSpy.open).toHaveBeenCalledWith(message, undefined, { duration });
    });

    it('should add a choice if input is not empty and choices length is less than MAX_CHOICES_NUMBER', () => {
        const choiceInput = 'New Choice';
        const choices: Choice[] = [];
        const editArray: boolean[] = [];

        createQuestionService.addChoice(choiceInput, choices, editArray);

        expect(choices.length).toEqual(1);
        expect(choices[0].text).toEqual(choiceInput);
        expect(choices[0].isCorrect).toBeFalse();
        expect(editArray.length).toEqual(1);
        expect(editArray[0]).toBeFalse();
        expect(snackBarSpy.open).not.toHaveBeenCalled();
    });

    it('should not add a choice if input is empty', () => {
        const choiceInput = '';
        const choices: Choice[] = [];
        const editArray: boolean[] = [];

        createQuestionService.addChoice(choiceInput, choices, editArray);

        expect(choices.length).toEqual(0);
        expect(editArray.length).toEqual(0);
        expect(snackBarSpy.open).toHaveBeenCalledWith('Le champ Choix doit être rempli pour créer un choix.', undefined, {
            duration: SNACKBAR_DURATION,
        });
    });

    it('should not add a choice if choices length is equal to MAX_CHOICES_NUMBER', () => {
        const choiceInput = 'New Choice';
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 3', isCorrect: false },
            { text: 'Choice 4', isCorrect: false },
        ];
        const editArray: boolean[] = [false, false, false, false];
        const lengthAfterRejection = choices.length;

        createQuestionService.addChoice(choiceInput, choices, editArray);

        expect(choices.length).toEqual(lengthAfterRejection);
        expect(editArray.length).toEqual(lengthAfterRejection);
        expect(snackBarSpy.open).toHaveBeenCalledWith('Vous ne pouvez pas ajouter plus de 4 choix.', undefined, { duration: SNACKBAR_DURATION });
    });

    it('should add a question to the bank if input is valid', async () => {
        const questionName = 'Test question';
        const questionPoints = 10;
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];
        const question: Question = {
            type: QuestionType.QCM,
            text: questionName,
            points: questionPoints,
            choices,
        };

        const mockResponse = new HttpResponse({ body: question, status: RESPONSE_CREATED });
        communicationServiceSpy.addQuestion.and.returnValue(of(mockResponse));

        const result = await createQuestionService.addToQuestionBank(questionName, questionPoints, choices);

        expect(result).not.toBeNull();
        expect(result?.text).toEqual(questionName);
        expect(result?.points).toEqual(questionPoints);
        expect(result?.choices).toEqual(choices);
    });

    it('should return null if input is invalid', async () => {
        const questionName = '';
        const questionPoints = 10;
        const choices: Choice[] = [];

        const result = await createQuestionService.addToQuestionBank(questionName, questionPoints, choices);

        expect(result).toBeNull();
    });

    it('should reject if communicationService.addQuestion fails', async () => {
        const questionName = 'Test question';
        const questionPoints = 10;
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];

        communicationServiceSpy.addQuestion.and.returnValue(throwError(() => new HttpResponse({ status: HttpStatusCode.Unauthorized })));
        await expectAsync(createQuestionService.addToQuestionBank(questionName, questionPoints, choices)).toBeRejected();
    });

    it('should return false and call openSnackBar with "Le champ Question ne peut pas être vide." if questionName is empty', () => {
        const result = createQuestionService.choiceVerif('', []);
        expect(result).toBe(false);
        expect(snackBarSpy.open).toHaveBeenCalledWith('Le champ Question ne peut pas être vide.', undefined, {
            duration: SNACKBAR_DURATION,
        });
    });

    it('should return false and call openSnackBar if choices are less than two', () => {
        const result = createQuestionService.choiceVerif('Test question', [{ text: 'Choice 1', isCorrect: false }]);
        expect(result).toBe(false);
        expect(snackBarSpy.open).toHaveBeenCalledWith("Veuillez ajouter au moins deux choix de réponse avant d'enregistrer la question.", undefined, {
            duration: SNACKBAR_DURATION,
        });
    });

    it('should return false and call openSnackBar if no correct answer is provided', () => {
        const result = createQuestionService.choiceVerif('Test question', [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 1', isCorrect: false },
        ]);
        expect(result).toBe(false);
        expect(snackBarSpy.open).toHaveBeenCalledWith("Il faut au moins une réponse et un choix éronné avant d'enregistrer la question.", undefined, {
            duration: SNACKBAR_DURATION,
        });
    });

    it('should return true if all conditions are met', () => {
        const result = createQuestionService.choiceVerif('Test question', [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ]);
        expect(result).toBe(true);
        expect(snackBarSpy.open).not.toHaveBeenCalled();
    });

    it('should resolve the promise when modification is successful', async () => {
        const questionName = 'Test question';
        const questionPoints = 10;
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ];
        const questionMongoId = 'mongoId123';
        const mockResponse = new HttpResponse<QuestionWithModificationDate>({ status: HttpStatusCode.Ok });
        communicationServiceSpy.modifyQuestion.and.returnValue(of(mockResponse));
        await expectAsync(createQuestionService.editQuestion(questionName, questionPoints, choices, questionMongoId)).toBeResolved();
    });

    it('should reject if communicationService.modifyQuestion fails', async () => {
        const questionName = 'Test question';
        const questionPoints = 10;
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];
        const questionMongoId = 'mongoId123';

        const errorResponse = new HttpResponse({ status: HttpStatusCode.BadRequest });
        communicationServiceSpy.modifyQuestion.and.returnValue(throwError(() => errorResponse));
        await expectAsync(createQuestionService.editQuestion(questionName, questionPoints, choices, questionMongoId)).toBeRejected();
    });

    it('should return true if there are both correct and incorrect choices', () => {
        const choices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];
        const hasAnswer = createQuestionService.hasAnswer(choices);
        expect(hasAnswer).toBe(true);
    });

    it('should return false if there are only incorrect choices', () => {
        const choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: false },
        ];
        const hasAnswer = createQuestionService.hasAnswer(choices);
        expect(hasAnswer).toBe(false);
    });

    it('should return false if choices array is empty', () => {
        const choices: Choice[] = [];
        const hasAnswer = createQuestionService.hasAnswer(choices);
        expect(hasAnswer).toBe(false);
    });
});
