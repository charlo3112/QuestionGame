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
import { Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { MAX_CHOICES_NUMBER, MIN_NB_OF_POINTS, QuestionType } from '@common/constants';
import { of } from 'rxjs';

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

    // test de la fonction ngOnChanges()
    /*
    it('should call fillform when questionData is provided', () => {
        const changesObj: SimpleChanges = {
            questionData: new SimpleChange({}, mockValidQuestion, true),
        };
        spyOn(component, 'fillForm');
        component.ngOnChanges(changesObj);
        expect(component.fillForm).toHaveBeenCalledWith(mockValidQuestion);
    });
    */

    it('should call resetForm when questionData is not provided', () => {
        const changesObj: SimpleChanges = {
            questionData: new SimpleChange({}, null, false),
        };
        spyOn(component, 'resetForm');
        component.ngOnChanges(changesObj);
        expect(component.resetForm).toHaveBeenCalled();
    });

    // test de la fonction ngOnChanges(), resetForm() et fillForm()

    /*
    it('should fill the form if we edit an already created question', () => {
        const newQuestion: Question = {
            text: 'Quelle est la capitale du Canada ?',
            points: 10,
            choices: [
                { text: 'Ottawa', isCorrect: true },
                { text: 'Toronto', isCorrect: false },
            ],
            type: QuestionType.Qcm,
        };

        const changesObj: SimpleChanges = {
            questionData: new SimpleChange(undefined, newQuestion, true),
        };
        component.ngOnChanges(changesObj);
        fixture.detectChanges();

        expect(component.questionName).toEqual(newQuestion.text);
        expect(component.questionPoints).toEqual(newQuestion.points);
        expect(component.choices).toEqual(newQuestion.choices);
    });

    it('should reset the form when questionData is null', () => {
        component.ngOnChanges({
            questionData: new SimpleChange({ text: 'Moc question', points: 20, choices: [] }, null, true),
        });
        expect(component.questionName).toBe('');
        expect(component.questionPoints).toBe(10);
        expect(component.choices.length).toBe(0);
    });*/

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

    it('should alert if there is an error during the add', () => {
        spyOn(component, 'openSnackBar');
        component.fillForm(mockInvalidQuestion);
        component.addToQuestionBank();
        expect(component.openSnackBar).toHaveBeenCalledWith("Il faut au moins une réponse et un choix éronné avant d'enregistrer la question.");
    });
});
