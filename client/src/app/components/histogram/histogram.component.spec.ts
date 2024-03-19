import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        const mockHistogramData: HistogramData = HISTOGRAM_DATA;
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
            currentState: GameState.Starting,
            histogramData: mockHistogramData,
        });
        Object.defineProperty(mockGameService, 'histogram', {
            get: jasmine.createSpy('histogram').and.returnValue(mockHistogramData),
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
        component.indexQuestionDisplayed = 1;
        component.previousQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });

    it('should wrap to the last question if the first question is displayed and previousQuestion is called', () => {
        component.indexQuestionDisplayed = 0;
        component.previousQuestion();
        expect(component.indexQuestionDisplayed).toBe(component.gameService.histogram.question.length - 1);
    });

    it('should go to next question when nextQuestion is called', () => {
        component.indexQuestionDisplayed = 0;
        component.nextQuestion();
        expect(component.indexQuestionDisplayed).toBe(1);
    });

    it('should wrap to the first question if the last question is displayed and nextQuestion is called', () => {
        component.indexQuestionDisplayed = component.gameService.histogram.question.length - 1;
        component.nextQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });
});
