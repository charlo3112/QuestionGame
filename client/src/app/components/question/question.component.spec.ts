import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionComponent } from '@app/components/question/question.component';
import { routes } from '@app/modules/app-routing.module';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';

describe('Question', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let router: Router;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let gameSubscriptionServiceSpy: jasmine.SpyObj<GameSubscriptionService>;

    let mockTest: boolean;
    let mockState: GameState;
    let mockHost: boolean;
    let mockGrade: Grade;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [
            'confirmQuestion',
            'selectChoice',
            'isChoiceCorrect',
            'isChoiceIncorrect',
            'isChoiceSelected',
            'nextStep',
            'nextQuestion',
            'showFinalResults',
            'grade',
            'sendQrlAnswer',
        ]);
        Object.defineProperty(gameServiceSpy, 'currentState', { get: () => mockState });
        Object.defineProperty(gameServiceSpy, 'isHost', { get: () => mockHost });
        Object.defineProperty(gameServiceSpy, 'isTest', { get: () => mockTest });
        Object.defineProperty(gameServiceSpy, 'grade', { get: () => mockGrade });
        mockGrade = Grade.Ungraded;
        gameSubscriptionServiceSpy = jasmine.createSpyObj('GameSubscriptionService', ['getGame', 'isTextLocked']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), BrowserAnimationsModule],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: GameSubscriptionService, useValue: gameSubscriptionServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.question = {
            type: QuestionType.QCM,
            text: 'Question test',
            points: 8,
            choices: [
                { text: 'A', isCorrect: true },
                { text: 'B', isCorrect: false },
                { text: 'C', isCorrect: false },
            ],
        };
        fixture.detectChanges();
        router = TestBed.inject(Router);
        router.initialNavigation();
        spyOn(router, 'navigate');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should detect enter key', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(event);
        expect(gameServiceSpy.confirmQuestion).toHaveBeenCalled();
    });

    it('should detect number key', () => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.buttonDetect(event);
        expect(gameServiceSpy.selectChoice).toHaveBeenCalledWith(0);
    });

    it('should not detect number key', () => {
        const event = new KeyboardEvent('keydown', { key: '0' });
        component.buttonDetect(event);
        expect(gameServiceSpy.selectChoice).not.toHaveBeenCalled();
    });

    it('should not detect when chat is focused', () => {
        component.chatFocused(true);
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.buttonDetect(event);
        expect(gameServiceSpy.selectChoice).not.toHaveBeenCalled();
    });

    it('should call confirmQuestion and disable the button when confirmAndDisable is called and buttonDisabled is false', () => {
        component.confirmAndDisable();
        expect(gameServiceSpy.confirmQuestion).toHaveBeenCalled();
    });

    it('should call confirmQuestion and disable the button when confirmAndDisable is called and buttonDisabled is false', () => {
        component.question = {
            type: QuestionType.QRL,
            text: 'Question test',
            points: 8,
        };
        component.confirmAndDisable();
        expect(gameServiceSpy.confirmQuestion).toHaveBeenCalled();
        expect(gameServiceSpy.sendQrlAnswer).toHaveBeenCalled();
    });

    it('should redirect to /new when nextStep is called and game is in LastQuestion state', () => {
        mockTest = true;
        mockState = GameState.LAST_QUESTION;
        component.nextStep();
        expect(router.navigate).toHaveBeenCalledWith(['/new']);
    });

    describe('showButtonResult', () => {
        it('should return false if game is not in LastQuestion state', () => {
            mockState = GameState.ASKING_QUESTION_QCM;
            expect(component.showButtonResult).toBeFalse();
        });

        it('should return false if user is not host', () => {
            mockState = GameState.LAST_QUESTION;
            mockHost = false;
            expect(component.showButtonResult).toBeFalse();
        });

        it('should return false if test is false', () => {
            mockState = GameState.LAST_QUESTION;
            mockHost = true;
            mockTest = false;
            expect(component.showButtonResult).toBeFalse();
        });

        it('should return true', () => {
            mockState = GameState.LAST_QUESTION;
            mockHost = true;
            mockTest = true;
            expect(component.showButtonResult).toBeTrue();
        });
    });

    describe('text', () => {
        it('should return the question text', () => {
            expect(component.text).toEqual("Réponse est en cours d'évaluation");
        });

        it('should return the grade', () => {
            mockGrade = Grade.One;
            expect(component.text).toEqual('Vous avez obtenu la note de 100%');
        });
    });

    describe('onAnswerChange', () => {
        it('should call sendQrlAnswer', () => {
            component.onAnswerChange();
            expect(gameServiceSpy.sendQrlAnswer).toHaveBeenCalled();
        });
    });

    describe('showText', () => {
        it('should return false if question type is not QRL', () => {
            component.question = {
                type: QuestionType.QCM,
                text: 'Question test',
                points: 8,
                choices: [
                    { text: 'A', isCorrect: true },
                    { text: 'B', isCorrect: false },
                    { text: 'C', isCorrect: false },
                ],
            };
            mockState = GameState.LAST_QUESTION;
            expect(component.showText).toBeFalse();
        });

        it('should return false if game is not in LastQuestion, ShowResults or WaitingForAnswers state', () => {
            component.question = {
                type: QuestionType.QRL,
                text: 'Question test',
                points: 8,
            };
            mockState = GameState.ASKING_QUESTION_QCM;
            expect(component.showText).toBeFalse();
        });

        it('should return true', () => {
            component.question = {
                type: QuestionType.QRL,
                text: 'Question test',
                points: 8,
            };
            mockState = GameState.LAST_QUESTION;
            expect(component.showText).toBeTrue();
        });
    });
});
