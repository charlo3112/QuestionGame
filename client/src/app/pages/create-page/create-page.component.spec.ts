// We disabled max-lines because we judge that we need that many to test thoroughly the component
// Plus, the testbench initialization is 100 lines long
/* eslint-disable max-lines */
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminService } from '@app/services/admin/admin.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { MIN_DURATION, MIN_NB_OF_POINTS } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { GAME_PLACEHOLDER, Game } from '@common/interfaces/game';
import { EMPTY_QUESTION, Question } from '@common/interfaces/question';
import { Observable, of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let mockValidQuestion1: Question;
    let mockValidQuestion2: Question;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let router: Router;
    let mockValidGame: Game;
    let routeSpy: jasmine.SpyObj<ActivatedRoute>;
    let gameCreationServiceSpy: jasmine.SpyObj<GameCreationService>;
    let adminServiceSpy: jasmine.SpyObj<AdminService>;

    let mockLogin: boolean;

    beforeEach(async () => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', ['login']);
        Object.defineProperty(adminServiceSpy, 'login', { get: () => mockLogin });

        mockLogin = true;

        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['addGame', 'editGame', 'getGameById', 'verifyLogin']);
        gameCreationServiceSpy = jasmine.createSpyObj('GameCreationService', ['save', 'createGame', 'updateGame']);

        const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
        paramMapSpy.get.and.returnValue();

        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            paramMap: of(paramMapSpy) as Observable<ParamMap>,
        });

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
                HttpClientTestingModule,
                MatToolbarModule,
            ],
            providers: [
                MatSnackBar,
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: GameCreationService, useValue: gameCreationServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: AdminService, useValue: adminServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
            type: QuestionType.QCM,
        };
        mockValidQuestion2 = {
            text: 'Quelle est la capitale de la France ?',
            points: MIN_NB_OF_POINTS,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'Lyon', isCorrect: false },
            ],
            type: QuestionType.QCM,
        };
        mockValidGame = {
            ...GAME_PLACEHOLDER,
            title: 'Test Game',
            description: 'Test Description',
            duration: MIN_DURATION,
            questions: [mockValidQuestion1, mockValidQuestion2],
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default values', () => {
        expect(component.showChildren).toBeFalse();
        expect(component['isEditing']).toBeFalse();
        expect(component.questions.length).toBe(0);
        expect(component.selectedQuestion).toBeNull();
    });

    // ngOnInit
    it('should resetForm if verifyLogin is true and create game if no game id', () => {
        const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
        paramMapSpy.get.and.returnValue(null);

        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            paramMap: of(paramMapSpy) as Observable<ParamMap>,
        });

        component['route'] = routeSpy;

        // spyOn(component, 'verifyLogin').and.returnValue(true);
        spyOn(component, 'resetForm');

        component.ngOnInit();

        expect(component.pageTitle).toEqual("Création d'un nouveau jeu");
        expect(component.resetForm).toHaveBeenCalled();
    });

    it('should go back to admin if verifyLogin is false', () => {
        mockLogin = false;
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

    it("should set pageTitle to \"Édition d'un jeu existant\" when there is an 'id' parameter in the route", () => {
        const paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);
        paramMapSpy.get.and.returnValue('1');

        routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
            paramMap: of(paramMapSpy) as Observable<ParamMap>,
        });

        component['route'] = routeSpy;

        // spyOn(component, 'verifyLogin').and.returnValue(true);
        spyOn(component, 'loadGameData');

        component.ngOnInit();

        expect(component.loadGameData).toHaveBeenCalledWith('1');
        expect(component.pageTitle).toBe("Édition d'un jeu existant");
    });

    // insertQuestionFromBank
    it('should insert a question from the question bank and close the bank', () => {
        component.questions = [mockValidQuestion1];
        const newQuestion: Question = mockValidQuestion2;
        expect(component.questions.length).toBe(1);
        spyOn(component, 'closeQuestionBank');
        component.insertQuestionFromBank(newQuestion);
        expect(component.questions.length).toBe(2);
        expect(component.questions[1]).toEqual(newQuestion);
        expect(component.closeQuestionBank).toHaveBeenCalled();
    });

    // insertQuestionFromCreate
    it('should insert a question from the createQuestion page and insert it', () => {
        component.questions = [mockValidQuestion1];
        const newQuestion: Question = mockValidQuestion2;
        expect(component.questions.length).toBe(1);
        spyOn(component, 'closeCreateQuestion');
        component.insertQuestionFromCreate(newQuestion);
        expect(component.questions.length).toBe(2);
        expect(component.questions[1]).toEqual(newQuestion);
        expect(component.closeCreateQuestion).toHaveBeenCalled();
    });

    it('should update an existing question', () => {
        component['questionTitleToEdit'] = mockValidQuestion1.text;
        component.questions = [mockValidQuestion1];
        const updatedQuestion: Question = {
            ...mockValidQuestion1,
            text: 'Quelle est la capitale de la France ?',
        };
        component.insertQuestionFromCreate(updatedQuestion);
        expect(component.questions.length).toBe(1);
        expect(component.questions[0].text).toBe(updatedQuestion.text);
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

    // openQuestionBank
    it('should open the question bank', () => {
        component.showPage = true;
        expect(component.selectedQuestion).toBeNull();
        component.openQuestionBank();
        expect(component.showPage).toBeFalse();
        expect(component.selectedQuestion).toEqual(EMPTY_QUESTION);
    });

    // closeQuestionBank
    it('should close the question bank', () => {
        component.showPage = false;
        component.closeQuestionBank();
        expect(component.showPage).toBeTrue();
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
    it('should call save from gameCreationService', async () => {
        await component.save();
        expect(gameCreationServiceSpy.save).toHaveBeenCalled();
    });

    // createGame
    it('should call the createGame method from the gameCreationService', () => {
        component.createGame(mockValidGame);
        expect(gameCreationServiceSpy.createGame).toHaveBeenCalledWith(mockValidGame);
    });

    // updateGame
    it('should call the updateGame method from the gameCreationService', () => {
        component.updateGame(mockValidGame);
        expect(gameCreationServiceSpy.updateGame).toHaveBeenCalledWith(mockValidGame);
    });

    // loadGameData
    it('should load the game data if the game id is valid', () => {
        communicationServiceSpy.getGameById.and.returnValue(of(mockValidGame));
        component.loadGameData('1');
        expect(component.title).toBe(mockValidGame.title);
        expect(component.description).toBe(mockValidGame.description);
        expect(component.duration).toBe(mockValidGame.duration);
        expect(component.questions).toBe(mockValidGame.questions);
    });

    it('should not load the game data if the game id is invalid', () => {
        spyOn(component['snackBar'], 'open');
        spyOn(window, 'alert');
        communicationServiceSpy.getGameById.and.returnValue(throwError(() => new Error('Internal Server Error')));
        component.loadGameData('1');
        expect(component['snackBar'].open).toHaveBeenCalled();
    });

    // resetForm
    it('should reset the form', () => {
        component.title = 'Test titre';
        component.questions = [mockValidQuestion1, mockValidQuestion2];
        component.description = 'Test description';
        component.duration = MIN_DURATION;
        component.resetForm();
        expect(component.title).toBe('');
        expect(component.questions).toEqual([]);
        expect(component.description).toBe('');
        expect(component.duration).toBe(MIN_DURATION);
    });

    // verifPresenceQuestion
    it('should return false if the question is already in the game', () => {
        component.questions = [mockValidQuestion1, mockValidQuestion2];
        expect(component.verifyPresenceQuestion(mockValidQuestion1)).toBeFalse();
    });

    it('should return true if the question is not in the game', () => {
        component.questions = [mockValidQuestion2];
        expect(component.verifyPresenceQuestion(mockValidQuestion1)).toBeTrue();
    });
    it('should return true if the question is in the game, but you are editing', () => {
        component.questions = [mockValidQuestion1, mockValidQuestion2];
        component.isEditingQuestion = true;
        expect(component.verifyPresenceQuestion(mockValidQuestion1)).toBeTrue();
    });
});
