import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
        });
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
        //component.listQuestions = QUESTIONS_PLACEHOLDER_COUNTER;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should go to previous question', () => {
        component.indexQuestionDisplayed = 1;
        component.previousQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });

    it('should go to last question if question displayed is 0', () => {
        component.indexQuestionDisplayed = 0;
        component.previousQuestion();
        expect(component.indexQuestionDisplayed).toBe(1);
    });

    it('should go to next question', () => {
        component.indexQuestionDisplayed = 0;
        component.nextQuestion();
        expect(component.indexQuestionDisplayed).toBe(1);
    });

    it('should go to first question if question displayed is last', () => {
        component.indexQuestionDisplayed = 1;
        component.nextQuestion();
        expect(component.indexQuestionDisplayed).toBe(0);
    });
});
