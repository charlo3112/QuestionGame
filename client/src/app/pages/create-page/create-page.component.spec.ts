import { DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Question, QuestionType } from '@app/interfaces/question';
import { MIN_NB_OF_POINTS } from '@common/constants';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let mockValidQuestion1: Question;
    let mockValidQuestion2: Question;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatSliderModule,
                MatButtonModule,
                MatIconModule,
                MatListModule,
                DragDropModule,
                RouterModule.forRoot([]),
                NoopAnimationsModule,
                CreatePageComponent,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        mockValidQuestion1 = {
            text: 'Quelle est la capitale du Canada ?',
            points: MIN_NB_OF_POINTS,
            choices: [
                { text: 'Ottawa', isCorrect: true },
                { text: 'Toronto', isCorrect: false },
            ],
            type: QuestionType.Qcm,
        };
        mockValidQuestion2 = {
            text: 'Quelle est la capitale de la France ?',
            points: MIN_NB_OF_POINTS,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'Marseille', isCorrect: false },
            ],
            type: QuestionType.Qcm,
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default values', () => {
        expect(component.showChildren).toBeFalse();
        expect(component.isEditing).toBeFalse();
        expect(component.questions.length).toBe(0);
        expect(component.selectedQuestion).toBeNull();
    });

    // insertQuestion
    it('should insert a new question', () => {
        const newQuestion: Question = mockValidQuestion1;
        expect(component.questions.length).toBe(0);
        component.insertQuestion(newQuestion);
        expect(component.questions.length).toBe(1);
        expect(component.questions[0]).toEqual(newQuestion);
    });

    it('should update an existing question', () => {
        const initialQuestion: Question = mockValidQuestion1;
        const updatedQuestion: Question = {
            ...initialQuestion,
            points: 50,
        };

        component.insertQuestion(initialQuestion);
        component.insertQuestion(updatedQuestion);

        expect(component.questions.length).toBe(1);
        expect(component.questions[0].points).toBe(updatedQuestion.points);
    });

    // deleteQuestion
    it('should delete a question at a specific index', () => {
        component.questions = [mockValidQuestion1, mockValidQuestion2];
        expect(component.questions.length).toBe(2);
        component.deleteQuestion(0);
        expect(component.questions.length).toBe(1);
        expect(component.questions[0].text).toBe(mockValidQuestion2.text);
    });

    it('should do nothing if the index is out of bounds', () => {
        component.insertQuestion(mockValidQuestion1);
        component.insertQuestion(mockValidQuestion2);
        const originalQuestionsLength = component.questions.length;
        component.deleteQuestion(3);
        expect(component.questions.length).toBe(originalQuestionsLength);
    });

    // drop

    // editQuestion et la selection d'une question à éditer
    it('should set selectedQuestion to the question to edit and show the child component', () => {
        expect(component.selectedQuestion).toBeNull();
        expect(component.showChildren).toBeFalse();
        component.editQuestion(mockValidQuestion1);
        expect(component.selectedQuestion).toEqual(mockValidQuestion1);
        expect(component.showChildren).toBeTrue();
    });

    // openCreateQuestion

    // closeCreateQuestion

    // save

    // checkFields
    it('should return false and alert if title is empty', () => {
        spyOn(window, 'alert');
        component.title = ''; // Pas de titre
        component.description = 'Description';
        component.duration = 20;
        component.questions = [mockValidQuestion1];
        expect(component.checkFields()).toBeFalse();
        expect(window.alert).toHaveBeenCalledWith('Veuillez entrer un nom pour le jeu.');
    });

    it('should return false and alert if description is empty', () => {
        spyOn(window, 'alert');
        component.title = 'Titre';
        component.description = ''; // Pas de description
        component.duration = 20;
        component.questions = [mockValidQuestion1];
        expect(component.checkFields()).toBeFalse();
        expect(window.alert).toHaveBeenCalledWith('Veuillez entrer une description pour le jeu.');
    });

    it('should return false and alert if duration is out of range', () => {
        spyOn(window, 'alert');
        component.title = 'Titre';
        component.description = 'Description';
        component.duration = 5; // Out of the valid range
        component.questions = [mockValidQuestion1];
        expect(component.checkFields()).toBeFalse();
        expect(window.alert).toHaveBeenCalledWith('Le temps alloué doit être compris entre 10 et 60.');
    });

    it('should return false and alert if there are no questions', () => {
        spyOn(window, 'alert');
        component.title = 'Valid title';
        component.description = 'Valid description';
        component.duration = 20;
        component.questions = [];
        expect(component.checkFields()).toBeFalse();
        expect(window.alert).toHaveBeenCalledWith('Le jeu doit au moins avoir une question.');
    });

    it('should return true if all fields are valid', () => {
        component.title = 'Valid title';
        component.description = 'Valid description';
        component.duration = 20;
        component.questions = [mockValidQuestion1];
        expect(component.checkFields()).toBeTrue();
    });
});
