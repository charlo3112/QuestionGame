import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY_QUESTION, questions } from '@app/interfaces/question';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game.service';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    const questionsPlace = [EMPTY_QUESTION];

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['startGame', 'getCurrent']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, RouterLink, RouterModule.forRoot(routes), BrowserAnimationsModule, GamePageComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        spyOn(window.history, 'state').and.returnValue({ question: questions });
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call startGame with state questions if available', () => {
        const state = { questions: questionsPlace };
        Object.defineProperty(window.history, 'state', { value: state });

        component.ngOnInit();

        expect(gameServiceSpy.startGame).toHaveBeenCalledWith(state.questions);
    });
    it('should call startGame with placeholder questions if state questions are not available', () => {
        const state = {};
        spyOn(window.history, 'state').and.returnValue(state);

        component.ngOnInit();

        expect(gameServiceSpy.startGame).toHaveBeenCalledWith(questions);
    });
});
