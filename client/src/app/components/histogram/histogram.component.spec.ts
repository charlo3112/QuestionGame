import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { QCMQuestion } from '@common/interfaces/question';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;

    let mockState: GameState;
    let mockHistogramData: HistogramData | undefined;

    beforeEach(() => {
        mockGameService = jasmine.createSpyObj('GameService', ['init', 'histogram'], {
            currentQuestion: {
                type: QuestionType.QCM,
                text: "Pourquoi le jus de lichi n'est pas bon?",
                points: 69,
                choices: [
                    { text: 'Guillaume en boit', isCorrect: true },
                    { text: 'Guillaume en a apporté 2 boites', isCorrect: false },
                    { text: "C'est du lichi", isCorrect: false },
                    { text: 'Guillaume en a bu à 9h du matin', isCorrect: false },
                ],
            },
            histogramData: mockHistogramData,
        });
        mockState = GameState.STARTING;
        mockHistogramData = HISTOGRAM_DATA;
        Object.defineProperty(mockGameService, 'currentState', {
            get: jasmine.createSpy('currentState').and.callFake(() => mockState),
        });
        Object.defineProperty(mockGameService, 'histogram', {
            get: jasmine.createSpy('histogram').and.callFake(() => mockHistogramData),
        });

        TestBed.configureTestingModule({
            imports: [],
            providers: [{ provide: GameService, useValue: mockGameService }],
        });
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
        component.indexQuestionDisplayed = 0;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should go to previous question when previousQuestion is called', () => {
        mockHistogramData = HISTOGRAM_DATA;
        component.indexQuestionDisplayed = 1;
        component.previousQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });

    it('should wrap to the last question if the first question is displayed and previousQuestion is called', () => {
        component.indexQuestionDisplayed = 0;
        mockHistogramData = HISTOGRAM_DATA;
        component.previousQuestion();
        expect(component.indexQuestionDisplayed).toBe(mockHistogramData.question.length - 1);
    });

    it('should wrap to the last question if the first question is displayed and previousQuestion is called', () => {
        component.indexQuestionDisplayed = 0;
        mockHistogramData = undefined;
        component.previousQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });

    it('should go to next question when nextQuestion is called', () => {
        component.indexQuestionDisplayed = 0;
        component.nextQuestion();
        expect(component.indexQuestionDisplayed).toBe(1);
    });

    it('should go to next question when nextQuestion is called', () => {
        component.indexQuestionDisplayed = 0;
        mockHistogramData = undefined;
        component.nextQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });

    it('should wrap to the first question if the last question is displayed and nextQuestion is called', () => {
        mockHistogramData = HISTOGRAM_DATA;
        component.indexQuestionDisplayed = mockHistogramData.question.length - 1;
        component.nextQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });

    describe('gradeData', () => {
        it('should return the grades of the current question', () => {
            mockHistogramData = HISTOGRAM_DATA;
            component.indexQuestionDisplayed = 1;
            const grades = mockHistogramData.histogram[1].type === QuestionType.QRL ? mockHistogramData.histogram[1].grades : [];
            expect(component.gradeData).toEqual(grades);
        });

        it('should return the grades of the current question', () => {
            mockHistogramData = HISTOGRAM_DATA;
            component.indexQuestionDisplayed = 0;
            const grades = mockHistogramData.histogram[0].type === QuestionType.QRL ? mockHistogramData.histogram[0].grades : [];
            expect(component.gradeData).toEqual(grades);
        });
    });

    describe('maxCounter', () => {
        it('should return the maximum counter of the current question', () => {
            component.indexQuestionDisplayed = 1;
            expect(component.maxCounter).toBe(0);
        });

        it('should return the maximum counter of the current question', () => {
            component.indexQuestionDisplayed = 0;
            const value = 10;
            expect(component.maxCounter).toBe(value);
        });
    });

    describe('zeroGrade', () => {
        it('should return the number of zero grades', () => {
            component.indexQuestionDisplayed = 1;
            expect(component.zeroGrade).toBe(1);
        });

        it('should return the number of zero grades', () => {
            component.indexQuestionDisplayed = 0;
            expect(component.zeroGrade).toBe(0);
        });
    });

    describe('halfGrade', () => {
        it('should return the number of half grades', () => {
            component.indexQuestionDisplayed = 1;
            expect(component.halfGrade).toBe(1);
        });

        it('should return the number of half grades', () => {
            component.indexQuestionDisplayed = 0;
            expect(component.halfGrade).toBe(0);
        });
    });

    describe('perfectGrade', () => {
        it('should return the number of perfect grades', () => {
            component.indexQuestionDisplayed = 1;
            expect(component.perfectGrade).toBe(1);
        });

        it('should return the number of perfect grades', () => {
            component.indexQuestionDisplayed = 0;
            expect(component.perfectGrade).toBe(0);
        });
    });

    describe('maxQRL', () => {
        it('should return the maximum QRL result', () => {
            mockHistogramData = HISTOGRAM_DATA;
            component.indexQuestionDisplayed = 1;
            expect(component.maxQRL).toBe(2);
        });

        it('should return the maximum QRL result', () => {
            mockHistogramData = HISTOGRAM_DATA;
            component.indexQuestionDisplayed = 0;
            expect(component.maxQRL).toBe(0);
        });
    });

    describe('maxQRLResult', () => {
        it('should return the maximum QRL result', () => {
            component.indexQuestionDisplayed = 1;
            expect(component.maxQRLResult).toBe(1);
        });

        it('should return the maximum QRL result', () => {
            component.indexQuestionDisplayed = 0;
            expect(component.maxQRLResult).toBe(0);
        });
    });

    describe('isFinalQrlResult', () => {
        it('should return true if the current question is not a QRL question', () => {
            component.indexQuestionDisplayed = 0;
            mockState = GameState.SHOW_FINAL_RESULTS;
            expect(component.isFinalQrlResult).toBeTrue();
        });

        it('should return true if the current state is not SHOW_FINAL_RESULTS', () => {
            component.indexQuestionDisplayed = 1;
            mockState = GameState.SHOW_FINAL_RESULTS;
            expect(component.isFinalQrlResult).toBeFalse();
        });
    });

    describe('getChoiceIndex', () => {
        it('should return the choice index', () => {
            component.indexQuestionDisplayed = 0;
            mockHistogramData = HISTOGRAM_DATA;
            const choice = (mockHistogramData.question[0] as QCMQuestion).choices[1];
            expect(component.getChoiceIndex(choice)).toBe(1);
        });

        it('should return the choice index', () => {
            component.indexQuestionDisplayed = 1;
            expect(component.getChoiceIndex({ text: 'Guillaume en boit', isCorrect: true })).toBe(0);
        });
    });

    describe('getChoiceCounter', () => {
        it('should return the choice counter', () => {
            component.indexQuestionDisplayed = 0;
            mockHistogramData = HISTOGRAM_DATA;
            const choice = (mockHistogramData.question[0] as QCMQuestion).choices[0];
            expect(component.getCounter(choice)).toBe(0);
        });

        it('should return the choice counter', () => {
            component.indexQuestionDisplayed = 1;
            expect(component.getCounter({ text: 'Guillaume en boit', isCorrect: true })).toBe(0);
        });
    });
});
