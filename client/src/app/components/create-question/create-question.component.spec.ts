import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Choice } from '@app/classes/choice';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { Question, QuestionWithModificationDate } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { MAX_CHOICES_NUMBER, MIN_NB_OF_POINTS, QuestionType } from '@common/constants';
import { of, throwError } from 'rxjs';

describe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;
    let mockValidQuestion: Question;
    let mockInvalidQuestion: Question;
    let communicationService: CommunicationService;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

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
            providers: [CommunicationService, { provide: MatSnackBar, useValue: snackBarSpy }],
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
            choices: [new Choice('Ottawa', true), new Choice('Montreal', false)],
            type: QuestionType.QCM,
        };
        mockInvalidQuestion = {
            text: 'Quelle est la capitale du Canada ?',
            points: MIN_NB_OF_POINTS,
            choices: [new Choice('Ottawa', false), new Choice('Montreal', false)],
            type: QuestionType.QCM,
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should have default values', () => {
        expect(component.questionName).toBe('');
        expect(component.questionPoints).toBe(MIN_NB_OF_POINTS);
        expect(component.choices.length).toBe(0);
    });

    // Test de la fonction addChoice()
    it('should add a new choice when addChoice() is called', () => {
        component.choiceInput = 'Nouveau choix';
        component.addChoice();
        expect(component.choices.length).toBe(1);
        expect(component.choices[0].text).toBe('Nouveau choix');
    });
    it('should not add a choice when input is empty', () => {
        spyOn(component, 'openSnackBar');
        component.choiceInput = '';
        component.addChoice();
        expect(component.choices.length).toBe(0);
        expect(component.openSnackBar).toHaveBeenCalledWith('Le champ Choix doit être rempli pour créer un choix.');
    });
    it('should not add more than 4 choices', () => {
        spyOn(component, 'openSnackBar');
        for (let i = 0; i < MAX_CHOICES_NUMBER; i++) {
            component.choices.push(new Choice('Choix ' + i, false));
        }
        component.choiceInput = 'Choix non ajouté';
        component.addChoice();
        expect(component.choices.length).toBe(MAX_CHOICES_NUMBER);
        expect(component.openSnackBar).toHaveBeenCalledWith('Vous ne pouvez pas ajouter plus de 4 choix.');
    });

    // test de la fonction deleteChoice()
    it('should delete the right choice', () => {
        component.choices = [new Choice('Choix 1', false), new Choice('Choix 2', true), new Choice('Choix 3', false)];
        expect(component.choices.length).toBe(3);
        component.deleteChoice(1);
        expect(component.choices.length).toBe(2);
        expect(component.choices[0].text).toBe('Choix 1');
        expect(component.choices[1].text).toBe('Choix 3');
    });

    it('should call resetForm when questionData is not provided', () => {
        const changesObj: SimpleChanges = {
            questionData: new SimpleChange({}, null, false),
        };
        spyOn(component, 'resetForm');
        component.ngOnChanges(changesObj);
        expect(component.resetForm).toHaveBeenCalled();
    });

    it('should call fillForm method when questionData changes and is not null', () => {
        const question: Question = {
            type: QuestionType.QCM,
            text: '',
            points: 0,
            choices: [],
        };
        const changesObj = {
            questionData: new SimpleChange(null, question, true),
        };
        component.questionData = question;
        spyOn(component, 'fillForm');
        component.ngOnChanges(changesObj);
        expect(component.fillForm).toHaveBeenCalled();
    });

    // test pour fillForm
    it('should fill the form with the correct question attributes', () => {
        component.fillForm(mockValidQuestion);
        expect(component.questionName).toBe(mockValidQuestion.text);
        expect(component.questionPoints).toBe(mockValidQuestion.points);
        expect(component.choices).toEqual(mockValidQuestion.choices);
    });

    // test pour choiceVerif
    it('should return false if the question name is empty', () => {
        spyOn(component, 'openSnackBar');
        mockValidQuestion.text = '';
        component.fillForm(mockValidQuestion);
        component.questionName = '';
        expect(component.choiceVerif()).toBe(false);
        expect(component.openSnackBar).toHaveBeenCalledWith('Le champ Question ne peut pas être vide.');
    });

    // test de la fonction save(), choiceVerif() et hasAnswer()
    it('should emit questionCreated event with correct data on save', () => {
        spyOn(component.questionCreated, 'emit');
        component.questionName = mockValidQuestion.text;
        component.questionPoints = mockValidQuestion.points;
        component.choices = mockValidQuestion.choices;
        component.save();
        expect(component.questionCreated.emit).toHaveBeenCalledWith({
            ...mockValidQuestion,
        });
    });

    // test avec aucun choix, un choix faux, deux faux, et un bon
    it('should verify choices correctly', () => {
        component.questionName = 'Test';
        component.choices = [];
        expect(component.choiceVerif()).toBeFalse();
        component.choices = [new Choice('Réponse 1', false)];
        expect(component.choiceVerif()).toBeFalse();
        component.choices.push(new Choice('Réponse 2', false));
        expect(component.choiceVerif()).toBeFalse();
        component.choices.push(new Choice('Réponse 3', true));
        expect(component.choiceVerif()).toBeTrue();
    });

    // test du cas normal
    it('should check for at least one correct and one incorrect answer', () => {
        component.choices = mockValidQuestion.choices;
        expect(component.hasAnswer()).toBeTrue();
        component.choices = mockInvalidQuestion.choices;
        expect(component.hasAnswer()).toBeFalse();
    });

    // test de la fonction startEdit et saveEdit()
    it('should toggle edit mode on and off', () => {
        component.choices = [new Choice('Réponse 1', false)];
        component.editArray = [false];

        component.startEdit(0);
        expect(component.editArray[0]).toBeTrue();

        component.saveEdit(0);
        expect(component.editArray[0]).toBeFalse();
    });

    // test de la fonction addToQuestionBank()
    it('should add the question to the question bank', () => {
        component.fillForm(mockValidQuestion);
        const mockResponse: HttpResponse<Question> = new HttpResponse({ status: 201, statusText: 'Created' });
        spyOn(communicationService, 'addQuestion').and.returnValue(of(mockResponse));
        spyOn(component.questionCreated, 'emit');
        component.addToQuestionBank();
        expect(component.questionCreated.emit).toHaveBeenCalledWith({
            ...mockValidQuestion,
        });
    });

    it('should add the question to the question bank', () => {
        component.fillForm(mockValidQuestion);
        spyOn(communicationService, 'addQuestion').and.returnValue(throwError(() => new Error('Internal Server Error')));
        component.addToQuestionBank();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should alert if there is an error during the add', () => {
        spyOn(component, 'openSnackBar');
        component.fillForm(mockInvalidQuestion);
        component.addToQuestionBank();
        expect(component.openSnackBar).toHaveBeenCalledWith("Il faut au moins une réponse et un choix éronné avant d'enregistrer la question.");
    });

    // test de la fonction editQuestion if()
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
        component.questionToDelete = mockValidQuestion.text;
        component.fillForm(mockValidQuestion);
        spyOn(communicationService, 'modifyQuestion').and.returnValue(throwError(() => new Error('Internal Server Error')));
        component.editQuestion();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    // test de la fonction editQuestion else()
    it('should not edit the question if there is no question to edit', () => {
        component.questionToDelete = '';
        spyOn(component, 'addToQuestionBank');
        component.editQuestion();
        expect(component.addToQuestionBank).toHaveBeenCalled();
    });

    // The method should move the selected choice to the new index in the 'choices' array.
    it('should move the selected choice to the new index in the choices array', () => {
        const choices: Choice[] = [new Choice('Choice 1', false), new Choice('Choice 2', false), new Choice('Choice 3', false)];
        component.choices = choices;
        const event: CdkDragDrop<Choice[]> = {
            previousIndex: 0,
            currentIndex: 2,
            item: null as unknown as CdkDrag<Choice[]>,
        } as CdkDragDrop<Choice[]>;
        component.drop(event);
        expect(component.choices).toEqual([new Choice('Choice 2', false), new Choice('Choice 3', false), new Choice('Choice 1', false)]);
    });
});
