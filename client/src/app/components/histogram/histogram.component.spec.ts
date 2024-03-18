import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionType } from '@common/enums/question-type';
import { Question, QUESTIONS_PLACEHOLDER_COUNTER, QuestionWithCounter } from '@common/interfaces/question';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    const questionsCounter: QuestionWithCounter[] = [
        {
            type: QuestionType.QCM,
            text: "Pourquoi le jus de lichi n'est pas bon?",
            points: 69,
            choices: [
                { text: 'Guillaume en boit', counter: 2, isCorrect: true },
                { text: 'Guillaume en a apporté 2 boites', counter: 1, isCorrect: false },
                { text: "C'est du lichi", counter: 0, isCorrect: false },
                { text: 'Guillaume en a bu à 9h du matin', counter: 6, isCorrect: true },
            ],
        },
        {
            type: QuestionType.QCM,
            text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
            points: 42,
            choices: [
                { text: 'Les temps de compilation sont abominables', counter: 2, isCorrect: false },
                { text: 'C.', counter: 4, isCorrect: false },
                { text: 'Le javascript est une erreur.', counter: 5, isCorrect: true },
            ],
        },
    ];
    const questions: Question[] = [
        {
            type: QuestionType.QCM,
            text: "Pourquoi le jus de lichi n'est pas bon?",
            points: 69,
            choices: [
                { text: 'Guillaume en boit', isCorrect: true },
                { text: 'Guillaume en a apporté 2 boites', isCorrect: false },
                { text: "C'est du lichi", isCorrect: false },
                { text: 'Guillaume en a bu à 9h du matin', isCorrect: true },
            ],
        },
        {
            type: QuestionType.QCM,
            text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
            points: 42,
            choices: [
                { text: 'Les temps de compilation sont abominables', isCorrect: false },
                { text: 'C.', isCorrect: false },
                { text: 'Le javascript est une erreur.', isCorrect: true },
            ],
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
        });
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
        component.listQuestions = QUESTIONS_PLACEHOLDER_COUNTER;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return true if choice has counter', () => {
        expect(component.isChoiceWithCounter(questionsCounter[0].choices[0])).toBeTrue();
    });

    it('should go to previous question', () => {
        component.questionDisplayed = 1;
        component.previousQuestion();
        expect(component.questionDisplayed).toBe(0);
    });

    it('should go to last question if question displayed is 0', () => {
        component.questionDisplayed = 0;
        component.previousQuestion();
        expect(component.questionDisplayed).toBe(1);
    });

    it('should go to next question', () => {
        component.questionDisplayed = 0;
        component.nextQuestion();
        expect(component.questionDisplayed).toBe(1);
    });

    it('should go to first question if question displayed is last', () => {
        component.questionDisplayed = 1;
        component.nextQuestion();
        expect(component.questionDisplayed).toBe(0);
    });

    it('should return max counter', () => {
        component.listQuestions = questionsCounter;
        component.questionDisplayed = 0;
        expect(component.getMaxCounter()).toBe(6);
    });

    it('should return 0 if no counter', () => {
        component.listQuestions = questions;
        expect(component.getMaxCounter()).toBe(0);
    });
});
