import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game.service';
import { GameState } from '@common/enums/game-state';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj(
            'GameService',
            ['init', 'leaveRoom', 'isChoiceSelected', 'isChoiceCorrect', 'isChoiceIncorrect', 'timerSubscribe', 'nextQuestion'],
            {
                currentQuestion: QUESTION_PLACEHOLDER,
                currentState: GameState.Starting,
            },
        );
        mockGameService.timerSubscribe.and.returnValue(of(0));
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, RouterLink, RouterModule.forRoot(routes), BrowserAnimationsModule, GamePageComponent],
            providers: [{ provide: GameService, useValue: mockGameService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        Object.defineProperties(window, { history: { value: { state: {} } } });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call gameService.init on ngOnInit', async () => {
        mockGameService.init.calls.reset();
        await component.ngOnInit();
        expect(mockGameService.init).toHaveBeenCalled();
    });

    it('should call gameService.leaveRoom on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(mockGameService.leaveRoom).toHaveBeenCalled();
    });

    it('should return true if game state is Starting', () => {
        expect(component.isStartingGame()).toBeTrue();
    });

    it('should change question when nextQuestion is called', () => {
        component.nextQuestion();
        expect(mockGameService.nextQuestion).toHaveBeenCalled();
    });

    it('should set showButton to true after countdownReachedZero is called three times', () => {
        component.countdownReachedZero();
        component.countdownReachedZero();
        component.countdownReachedZero();

        expect(component.showButton).toBeTrue();
    });
});
