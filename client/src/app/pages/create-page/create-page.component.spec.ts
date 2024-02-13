import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
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
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Choice } from '@app/classes/choice';
import { GAME_PLACEHOLDER, Game } from '@app/interfaces/game';
import { EMPTY_QUESTION, Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { MIN_DURATION, MIN_NB_OF_POINTS, QuestionType } from '@common/constants';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let mockValidQuestion1: Question;
    let mockValidQuestion2: Question;
    let communicationService: CommunicationService;
    let router: Router;
    let mockValidGame: Game;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

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
            providers: [{ provide: MatSnackBar, useValue: snackBarSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
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
            choices: [new Choice('Ottawa', true), new Choice('Toronto', false)],
            type: QuestionType.QCM,
        };
        mockValidQuestion2 = {
            text: 'Quelle est la capitale de la France ?',
            points: MIN_NB_OF_POINTS,
            choices: [new Choice('Paris', true), new Choice('Lyon', false)],
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
        expect(component.isEditing).toBeFalse();
        expect(component.questions.length).toBe(0);
        expect(component.selectedQuestion).toBeNull();
    });

    // ngOnInit
    it('should set login to false and save it to sessionStorage when no login info is found', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue(null);
        const setItemSpy = spyOn(sessionStorage, 'setItem');
        const result = component.verifyLogin();
        expect(component.login).toBeFalse();
        expect(setItemSpy).toHaveBeenCalledWith('login', JSON.stringify(false));
        expect(result).toBeFalse();
    });

    it('should resetForm if verifyLogin is true and create game if no game id', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(true));
        component.ngOnInit();
        expect(component.pageTitle).toEqual("Création d'un nouveau jeu");
    });

    // it('should load game data if verifyLogin is true and edit game', fakeAsync(() => {
    //     spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(true));
    //     TestBed.overrideProvider(ActivatedRoute, {
    //         useValue: {
    //             paramMap: of(convertToParamMap({ id: '123' })),
    //         },
    //     });
    //     TestBed.configureTestingModule({
    //         declarations: [CreatePageComponent],
    //     });
    //     fixture = TestBed.createComponent(CreatePageComponent);
    //     component = fixture.componentInstance;
    //     spyOn(component, 'verifyLogin').and.returnValue(true);
    //     fixture.detectChanges();
    //     tick();
    //     expect(component.pageTitle).toEqual("Édition d'un jeu existant");
    // }));

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
    it('should insert a question from the create and close the create', () => {
        component.questions = [mockValidQuestion1];
        const newQuestion: Question = mockValidQuestion2;
        expect(component.questions.length).toBe(1);
        spyOn(component, 'closeCreateQuestion');
        component.insertQuestionFromCreate(newQuestion);
        expect(component.questions.length).toBe(2);
        expect(component.questions[1]).toEqual(newQuestion);
        expect(component.closeCreateQuestion).toHaveBeenCalled();
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
    it('should do nothing if the form is invalid', () => {
        spyOn(window, 'alert');
        component.title = '';
        component.questions = [mockValidQuestion1];
        component.description = 'test description';
        component.duration = MIN_DURATION;
        component.save();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should create a game if the form is valid', fakeAsync(() => {
        component.isEditing = false;
        component.title = 'Test titre';
        component.questions = [mockValidQuestion1, mockValidQuestion2];
        component.description = 'Test description';
        component.duration = MIN_DURATION;
        component.save();
        const mockResponse: HttpResponse<string> = new HttpResponse({ status: 201, statusText: 'Created' });
        spyOn(communicationService, 'addGame').and.returnValue(of(mockResponse));
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    }));

    it('should update a game if the form is valid', () => {
        component.isEditing = true;
        component.title = 'Test titre';
        component.questions = [mockValidQuestion1, mockValidQuestion2];
        component.description = 'Test description';
        component.duration = MIN_DURATION;
        component.save();
        const mockResponse: HttpResponse<Game> = new HttpResponse({ status: 200, statusText: 'OK' });
        spyOn(communicationService, 'editGame').and.returnValue(of(mockResponse));
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    // createGame
    it('should create a game if the communicationService doesnt return an error', () => {
        spyOn(window, 'alert');
        const mockResponse: HttpResponse<string> = new HttpResponse({ status: 201, statusText: 'Created' });
        spyOn(communicationService, 'addGame').and.returnValue(of(mockResponse));
        component.createGame(mockValidGame);
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should not create a game if the communicationService return an error', () => {
        spyOn(window, 'alert');
        spyOn(communicationService, 'addGame').and.returnValue(throwError(() => new Error('Internal Server Error')));
        component.createGame(mockValidGame);
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    // updateGame
    it('should update a game if the communicationService doesnt return an error', () => {
        spyOn(window, 'alert');
        const mockResponse: HttpResponse<Game> = new HttpResponse({ status: 200, statusText: 'OK' });
        spyOn(communicationService, 'editGame').and.returnValue(of(mockResponse));
        component.updateGame(mockValidGame);
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should not update a game if the communicationService return an error', () => {
        spyOn(window, 'alert');
        spyOn(communicationService, 'editGame').and.returnValue(throwError(() => new Error('Internal Server Error')));
        component.updateGame(mockValidGame);
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    // loadGameData
    it('should load the game data if the game id is valid', () => {
        spyOn(communicationService, 'getGameById').and.returnValue(of(mockValidGame));
        component.loadGameData('1');
        expect(component.title).toBe(mockValidGame.title);
        expect(component.description).toBe(mockValidGame.description);
        expect(component.duration).toBe(mockValidGame.duration);
        expect(component.questions).toBe(mockValidGame.questions);
    });

    it('should not load the game data if the game id is invalid', () => {
        spyOn(window, 'alert');
        spyOn(communicationService, 'getGameById').and.returnValue(throwError(() => new Error('Internal Server Error')));
        component.loadGameData('1');
        expect(snackBarSpy.open).toHaveBeenCalled();
    });
});
