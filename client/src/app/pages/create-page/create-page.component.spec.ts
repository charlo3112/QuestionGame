import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
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
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY_QUESTION, Question, QuestionType } from '@app/interfaces/question';
import { MIN_NB_OF_POINTS } from '@common/constants';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let mockValidQuestion1: Question;
    let mockValidQuestion2: Question;
    let router: Router;

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
                RouterTestingModule.withRoutes([]),
                NoopAnimationsModule,
                CreatePageComponent,
                HttpClientModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
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

    // ngOnInit
    it('should resetForm if verifyLogin is true and create game if no game id', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(true));
        component.ngOnInit();
        expect(component.pageTitle).toEqual("Création d'un nouveau jeu");
    });

    /*
    it('should load game data if verifyLogin is true and edit game', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(true));

        component.ngOnInit();
        expect(component.pageTitle).toEqual("Édition d'un jeu existant");
    });
    */

    it('should go back to admin if verifyLogin is false', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(false));
        component.ngOnInit();
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
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
    it('should reorder questions correctly when drop is called', () => {
        component.questions = [mockValidQuestion1, mockValidQuestion2];
        const startIndex = 0;
        const endIndex = 1;
        const event: CdkDragDrop<Question[]> = {
            previousIndex: startIndex,
            currentIndex: endIndex,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
        } as CdkDragDrop<Question[]>;

        component.drop(event);
        expect(component.questions[startIndex]).toEqual(mockValidQuestion2);
        expect(component.questions[endIndex]).toEqual(mockValidQuestion1);
    });

    // editQuestion et la selection d'une question à éditer
    it('should set selectedQuestion to the question to edit and show the child component', () => {
        expect(component.selectedQuestion).toBeNull();
        expect(component.showChildren).toBeFalse();
        component.editQuestion(mockValidQuestion1);
        expect(component.selectedQuestion).toEqual(mockValidQuestion1);
        expect(component.showChildren).toBeTrue();
    });

    // openCreateQuestion
    it('should open the question creation form', () => {
        expect(component.showChildren).toBeFalse();
        expect(component.selectedQuestion).toBeNull();
        component.openCreateQuestion();
        expect(component.showChildren).toBeTrue();
        expect(component.selectedQuestion).toEqual(EMPTY_QUESTION);
    });

    // closeCreateQuestion
    it('should close the question creation or editing form', () => {
        component.showChildren = true;
        component.closeCreateQuestion();
        expect(component.showChildren).toBeFalse();
    });

    // save

    // createGame

    // updateGame

    // loadGameData

    // fillForm

    // resetForm
});
