import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GAME_PLACEHOLDER } from '@app/interfaces/game';
import { EMPTY_QUESTION } from '@app/interfaces/question';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['startGame', 'getCurrent']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, RouterLink, RouterModule.forRoot(routes), BrowserAnimationsModule, GamePageComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
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

    it('should call startGame with state questions if available', () => {
        const gamePlaceholder = structuredClone(GAME_PLACEHOLDER);
        gamePlaceholder.questions = [EMPTY_QUESTION];
        const state = { game: gamePlaceholder };
        Object.defineProperty(window.history, 'state', { value: state, configurable: true });

        component.ngOnInit();

        expect(gameServiceSpy.startGame).toHaveBeenCalledWith(state.game);
    });
    it('should call startGame with placeholder questions if state questions are not available', () => {
        Object.defineProperty(window.history, 'state', { value: { game: undefined }, configurable: true });

        component.ngOnInit();

        expect(gameServiceSpy.startGame).toHaveBeenCalledWith(GAME_PLACEHOLDER);
    });
});
