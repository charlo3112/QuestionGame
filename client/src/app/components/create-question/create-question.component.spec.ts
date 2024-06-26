import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CreateQuestionService } from '@app/services/create-question/create-question.service';
import { MAX_CHOICES_NUMBER, MIN_NB_OF_POINTS } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { Choice } from '@common/interfaces/choice';
import { Question, QuestionWithModificationDate } from '@common/interfaces/question';
import { of, throwError } from 'rxjs';

describe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;
    let mockValidQuestion: Question;
    let communicationService: CommunicationService;
    let createQuestionServiceSpy: jasmine.SpyObj<CreateQuestionService>;

    beforeEach(async () => {
        createQuestionServiceSpy = jasmine.createSpyObj('createQuestionServiceSpy', [
            'addQuestion',
            'modifyQuestion',
            'addToQuestionBank',
            'addChoice',
            'choiceVerif',
        ]);

        await TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSliderModule,
                MatButtonModule,
                MatIconModule,
                MatCheckboxModule,
                NoopAnimationsModule,
                HttpClientModule,
            ],
            providers: [CommunicationService, MatSnackBar, { provide: CreateQuestionService, useValue: createQuestionServiceSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(CreateQuestionComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
        fixture.detectChanges();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQuestionComponent);
        component = fixture.componentInstance;
        mockValidQuestion = {
            text: 'Quelle est la capitale du Canada ?',
            points: MIN_NB_OF_POINTS,
            choices: [
                { text: 'Ottawa', isCorrect: true },
                { text: 'Montreal', isCorrect: false },
            ],
            type: QuestionType.QCM,
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('ngOnInit() should fill the choiceValue array', () => {
        component.questionData = mockValidQuestion;
        component.ngOnInit();
        expect(component.choiceValue.length).toBe(2);
    });

    it('should call fillForm method when questionData changes and is not null', () => {
        const question: Question = {
            type: QuestionType.QCM,
            text: '',
            points: 0,
            choices: [
                { text: 'Choice 1', isCorrect: false },
                { text: 'Choice 2', isCorrect: true },
            ],
        };
        const changesObj = {
            questionData: new SimpleChange(null, question, true),
        };
        component.questionData = question;
        spyOn(component, 'fillForm');
        component.ngOnChanges(changesObj);
        expect(component.fillForm).toHaveBeenCalled();
    });

    it('should call fillForm method when questionData changes and is not null', () => {
        const question: Question = {
            type: QuestionType.QRL,
            text: '',
            points: 0,
        };
        component.fillForm(question);
        expect(component.questionName).toBe('');
        expect(component.questionPoints).toBe(0);
        expect(component.choices.length).toBe(0);
    });

    it('should call resetForm when questionData is not provided', () => {
        const changesObj: SimpleChanges = {
            questionData: new SimpleChange({}, null, false),
        };
        spyOn(component, 'resetForm');
        component.ngOnChanges(changesObj);
        expect(component.resetForm).toHaveBeenCalled();
    });

    // Test de la fonction addChoice()
    it('should add a new choice when addChoice() is called', () => {
        const choiceInput = 'Nouveau choix';
        component.choiceInput = choiceInput;
        component.choices = [];
        component.editArray = [];
        component.addChoice();

        expect(createQuestionServiceSpy.addChoice).toHaveBeenCalledWith(choiceInput, component.choices, component.editArray);
    });
    it('should not add a choice when input is empty', () => {
        spyOn(component, 'openSnackBar');
        component.choiceInput = '';
        component.choices = [];
        component.editArray = [];
        createQuestionServiceSpy.addChoice(component.choiceInput, component.choices, component.editArray);
        component.addChoice();
        expect(component.choices.length).toBe(0);
    });
    it('should not add more than 4 choices', () => {
        spyOn(component, 'openSnackBar');
        for (let i = 0; i < MAX_CHOICES_NUMBER; i++) {
            component.choices.push({ text: 'Choix ' + i, isCorrect: false });
        }
        component.choiceInput = 'Choix non ajouté';
        component.editArray = [];
        createQuestionServiceSpy.addChoice(component.choiceInput, component.choices, component.editArray);
        component.addChoice();
        expect(component.choices.length).toBe(MAX_CHOICES_NUMBER);
    });

    // test de la fonction addToQuestionBank()
    it('should add the question to the question bank QCM', async () => {
        component.fillForm(mockValidQuestion);
        createQuestionServiceSpy.addToQuestionBank.and.resolveTo(mockValidQuestion);
        spyOn(component.questionCreated, 'emit');
        spyOn(component.closeForm, 'emit');
        await component.addToQuestionBank();
        expect(component.questionCreated.emit).toHaveBeenCalledWith({
            ...mockValidQuestion,
        });
        expect(component.closeForm.emit).toHaveBeenCalled();
    });

    it('should add the question to the question bank QRL', async () => {
        component.fillForm(mockValidQuestion);
        component.questionType = QuestionType.QRL;
        createQuestionServiceSpy.addToQuestionBank.and.resolveTo(mockValidQuestion);
        spyOn(component.questionCreated, 'emit');
        spyOn(component.closeForm, 'emit');
        await component.addToQuestionBank();
        expect(component.questionCreated.emit).toHaveBeenCalledWith({
            ...mockValidQuestion,
        });
        expect(component.closeForm.emit).toHaveBeenCalled();
    });

    it('should call openSnackBar if addToQuestionBank fails', fakeAsync(() => {
        createQuestionServiceSpy.addToQuestionBank.and.returnValue(Promise.reject());
        spyOn(component['snackBar'], 'open');
        component.addToQuestionBank();
        tick();
        expect(component['snackBar'].open).toHaveBeenCalledWith('La question est déjà dans la banque de questions.', undefined, jasmine.any(Object));
    }));

    // test de la fonction cancel()
    it('should revert changes and emit close form event on cancel', () => {
        component.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ];
        component.choiceValue = component.choices.map((choice) => choice.isCorrect ?? false);
        component.choiceValue[0] = true;
        component.choiceValue[1] = false;
        spyOn(component.closeForm, 'emit');
        component.cancel();
        expect(component.choices[0].isCorrect).toBe(true);
        expect(component.choices[1].isCorrect).toBe(false);
        expect(component.closeForm.emit).toHaveBeenCalled();
    });

    // test de la fonction deleteChoice()
    it('should delete the right choice', () => {
        component.choices = [
            { text: 'Choix 1', isCorrect: false },
            { text: 'Choix 2', isCorrect: true },
            { text: 'Choix 3', isCorrect: false },
        ];
        expect(component.choices.length).toBe(3);
        component.deleteChoice(1);
        expect(component.choices.length).toBe(2);
        expect(component.choices[0].text).toBe('Choix 1');
        expect(component.choices[1].text).toBe('Choix 3');
    });

    // The method should move the selected choice to the new index in the 'choices' array.
    it('should move the selected choice to the new index in the choices array', () => {
        const choices: Choice[] = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 3', isCorrect: false },
        ];
        component.choices = choices;
        const event: CdkDragDrop<Choice[]> = {
            previousIndex: 0,
            currentIndex: 2,
            item: null as unknown as CdkDrag<Choice[]>,
        } as CdkDragDrop<Choice[]>;
        component.drop(event);
        expect(component.choices).toEqual([
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 3', isCorrect: false },
            { text: 'Choice 1', isCorrect: false },
        ]);
    });

    // test de la fonction editQuestion
    it('should edit the question if there is a question to edit', () => {
        component.questionToDelete = mockValidQuestion.text;
        component.fillForm(mockValidQuestion);
        const mockResponse: HttpResponse<QuestionWithModificationDate> = new HttpResponse({ status: 200, statusText: 'OK' });
        spyOn(communicationService, 'modifyQuestion').and.returnValue(of(mockResponse));
        spyOn(component.closeForm, 'emit');
        component.editQuestion();
        expect(component.closeForm.emit).toHaveBeenCalled();
    });

    it('should alert if there is an error during the edit', () => {
        spyOn(component['snackBar'], 'open');
        component.questionToDelete = mockValidQuestion.text;
        component.fillForm(mockValidQuestion);
        spyOn(communicationService, 'modifyQuestion').and.returnValue(throwError(() => new Error('Internal Server Error')));
        component.editQuestion();
        expect(component['snackBar'].open).toHaveBeenCalled();
    });

    it('should not edit the question if there is no question to edit', () => {
        component.questionToDelete = '';
        spyOn(component, 'addToQuestionBank');
        component.editQuestion();
        expect(component.addToQuestionBank).toHaveBeenCalled();
    });

    // test pour fillForm
    it('should fill the form with the correct question attributes', () => {
        component.fillForm(mockValidQuestion);
        expect(component.questionName).toBe(mockValidQuestion.text);
        expect(component.questionPoints).toBe(mockValidQuestion.points);
        if (mockValidQuestion.type === QuestionType.QCM) expect(component.choices).toEqual(mockValidQuestion.choices);
    });

    // test de la fonction save() et hasAnswer()
    it('should emit questionCreated event with correct data on save for QCM', () => {
        spyOn(component.questionCreated, 'emit');
        component.questionName = mockValidQuestion.text;
        component.questionPoints = mockValidQuestion.points;
        if (mockValidQuestion.type === QuestionType.QCM) component.choices = mockValidQuestion.choices;
        component.questionType = QuestionType.QCM;
        createQuestionServiceSpy.choiceVerif.and.returnValue(true);
        component.save();
        expect(component.questionCreated.emit).toHaveBeenCalledWith({
            ...mockValidQuestion,
        });
    });

    it('should emit questionCreated event with correct data on save for QRL', () => {
        mockValidQuestion = {
            text: 'Quelle est la capitale du Canada ?',
            points: MIN_NB_OF_POINTS,
            type: QuestionType.QRL,
        };
        spyOn(component.questionCreated, 'emit');
        component.questionName = mockValidQuestion.text;
        component.questionPoints = mockValidQuestion.points;
        component.questionType = QuestionType.QRL;
        createQuestionServiceSpy.choiceVerif.and.returnValue(true);
        component.save();
        expect(component.questionCreated.emit).toHaveBeenCalledWith({
            ...mockValidQuestion,
        });
    });

    // test de la fonction startEdit et saveEdit()
    it('should toggle edit mode on and off', () => {
        component.choices = [{ text: 'Réponse 1', isCorrect: false }];
        component.editArray = [false];

        component.startEdit(0);
        expect(component.editArray[0]).toBeTrue();

        component.saveEdit(0);
        expect(component.editArray[0]).toBeFalse();
    });
});
