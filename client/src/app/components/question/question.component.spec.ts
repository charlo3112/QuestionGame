import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionComponent } from '@app/components/question/question.component';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { of } from 'rxjs';

const mockQuestion = {
    type: QuestionType.QCM,
    text: 'Question test',
    points: 8,
    choices: [
        { text: 'A', isCorrect: true },
        { text: 'B', isCorrect: false },
        { text: 'C', isCorrect: false },
    ],
};

describe('Question', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let router: Router;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [
            'confirmQuestion',
            'selectChoice',
            'isChoiceCorrect',
            'isChoiceIncorrect',
            'isChoiceSelected',
            'stateSubscribe',
        ]);
        gameServiceSpy.stateSubscribe.and.returnValue(of({ state: GameState.AskingQuestion, payload: mockQuestion }));
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), BrowserAnimationsModule],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.question = mockQuestion;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        router.initialNavigation();
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
        component.buttonDisabled = false;
        component.confirmAndDisable();
        expect(gameServiceSpy.confirmQuestion).toHaveBeenCalled();
    });

    it('should reset button', () => {
        const mockButton = document.createElement('button');
        mockButton.disabled = true;
        spyOn(document, 'getElementById').and.returnValue(mockButton);
        component.resetButton();
        expect(mockButton.disabled).toBeFalse();
        expect(component.buttonDisabled).toBeFalse();
    });

    it('should disable button when state is LastQuestion', fakeAsync(() => {
        const mockButton = document.createElement('button');
        spyOn(document, 'getElementById').and.returnValue(mockButton);
        gameServiceSpy.stateSubscribe.and.returnValue(of({ state: GameState.LastQuestion }));
        component.ngOnInit();
        tick();
        expect(mockButton.disabled).toBeTrue();
        expect(component.buttonDisabled).toBeTrue();
    }));

    it('should reset button and changesCounter when ngOnChanges is called with specific changes', () => {
        component.changesCounter = 2;
        const mockButton = document.createElement('button');
        spyOn(document, 'getElementById').and.returnValue(mockButton);
        const changes: SimpleChanges = {
            question: new SimpleChange(undefined, mockQuestion, false),
        };

        component.ngOnChanges(changes);
        expect(mockButton.disabled).toBeFalse();
    });
});
