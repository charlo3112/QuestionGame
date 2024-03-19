import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game.service';
import { GameState } from '@common/enums/game-state';
import { HistogramData } from '@common/interfaces/histogram-data';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    const mockHistogramData: HistogramData = {
        question: [QUESTION_PLACEHOLDER],
        indexCurrentQuestion: 0,
        choicesCounters: [
            [10, 0, 0],
            [0, 0, 10],
        ],
    };

    beforeEach(() => {
        mockGameService = jasmine.createSpyObj(
            'GameService',
            [
                'init',
                'leaveRoom',
                'isChoiceSelected',
                'isChoiceCorrect',
                'isChoiceIncorrect',
                'timerSubscribe',
                'nextQuestion',
                'showResults',
                'stateSubscribe',
            ],
            {
                currentQuestion: QUESTION_PLACEHOLDER,
                currentState: GameState.Starting,
                histogramData: mockHistogramData,
            },
        );
        TestBed.configureTestingModule({
            imports: [],
            providers: [{ provide: GameService, useValue: mockGameService }],
        });
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;

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
