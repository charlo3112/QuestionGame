import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { Question, QuestionType } from '@app/interfaces/question';
import { MAX_CHOICES_NUMBER, MIN_NB_OF_POINTS } from '@common/constants';

describe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;
    let mockValidQuestion: Question;
    let mockInvalidQuestion: Question;

    beforeEach(async () => {
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
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQuestionComponent);
        component = fixture.componentInstance;
        mockValidQuestion = {
            text: 'Quelle est la capitale du Canada ?',
            points: MIN_NB_OF_POINTS,
            choices: [
                { text: 'Ottawa', isCorrect: true },
                { text: 'Toronto', isCorrect: false },
            ],
            type: QuestionType.Qcm,
        };
        mockInvalidQuestion = {
            text: 'Quelle est la capitale du Canada ?',
            points: MIN_NB_OF_POINTS,
            choices: [
                { text: 'Montreal', isCorrect: false },
                { text: 'Toronto', isCorrect: false },
            ],
            type: QuestionType.Qcm,
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
        spyOn(window, 'alert');
        component.choiceInput = '';
        component.addChoice();
        expect(component.choices.length).toBe(0);
        expect(window.alert).toHaveBeenCalledWith('Le champ Choix doit être rempli pour créer un choix.');
    });
    it('should not add more than 4 choices', () => {
        spyOn(window, 'alert');
        for (let i = 0; i < MAX_CHOICES_NUMBER; i++) {
            component.choices.push({ text: `Choix ${i}`, isCorrect: false });
        }
        component.choiceInput = 'Choix non ajouté';
        component.addChoice();
        expect(component.choices.length).toBe(MAX_CHOICES_NUMBER);
        expect(window.alert).toHaveBeenCalledWith('Vous ne pouvez pas ajouter plus de 4 choix.');
    });

    // test de la fonction deleteChoice()
    it('should delete the right choice', () => {
        component.choices = [
            { text: 'Choix 1', isCorrect: false },
            { text: 'Choix 2', isCorrect: false },
            { text: 'Choix 3', isCorrect: false },
        ];
        expect(component.choices.length).toBe(3);
        component.deleteChoice(1);
        expect(component.choices.length).toBe(2);
        expect(component.choices[0].text).toBe('Choix 1');
        expect(component.choices[1].text).toBe('Choix 3');
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
        component.choices = [{ text: 'Réponse 1', isCorrect: false }];
        expect(component.choiceVerif()).toBeFalse();
        component.choices.push({ text: 'Réponse 2', isCorrect: false });
        expect(component.choiceVerif()).toBeFalse();
        component.choices.push({ text: 'Réponse 3', isCorrect: true });
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
        component.choices = [{ text: 'Choix 1', isCorrect: false }];
        component.editArray = [false];

        component.startEdit(0);
        expect(component.editArray[0]).toBeTrue();

        component.saveEdit(0);
        expect(component.editArray[0]).toBeFalse();
    });
});
