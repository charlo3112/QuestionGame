import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { GAME_PLACEHOLDER, Game } from '@app/interfaces/game';
import { Result } from '@app/interfaces/result';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { of, throwError } from 'rxjs';
import { StartGamePageComponent } from './startgame-page.component';
import SpyObj = jasmine.SpyObj;

describe('StartGamePageComponent', () => {
    let component: StartGamePageComponent;
    let fixture: ComponentFixture<StartGamePageComponent>;
    let router: Router;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let snackBarSpy: SpyObj<MatSnackBar>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGames', 'getGameByID']);
        communicationServiceSpy.getGames.and.returnValue(of({ ok: true, value: [GAME_PLACEHOLDER] } as Result<Game[]>));

        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        await TestBed.configureTestingModule({
            imports: [
                StartGameExpansionComponent,
                StartGamePageComponent,
                RouterTestingModule,
                RouterLink,
                MatExpansionModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                MatSnackBarModule,
                HttpClientModule,
                RouterModule.forRoot(routes),
            ],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(StartGamePageComponent);
        spyOn(URL, 'createObjectURL').and.returnValue('mock-object-url');
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a title', () => {
        expect(component.title).toBe('Liste de jeux');
    });

    it('should show snackbar when error occurs during loadGames', fakeAsync(() => {
        communicationServiceSpy.getGames.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        spyOn(component, 'openSnackBar');
        component.loadGames();
        tick();
        expect(component.openSnackBar).toHaveBeenCalled();
    }));

    it('should show snackbar when loadGames is called and is not ok', fakeAsync(() => {
        communicationServiceSpy.getGames.and.returnValue(of({ ok: false } as Result<Game[]>));
        spyOn(component, 'openSnackBar');
        component.loadGames();
        tick();
        expect(component.openSnackBar).toHaveBeenCalledWith('Error fetching games');
    }));

    it('should have a list of games', () => {
        expect(component.games.length).toBeGreaterThan(0);
    });

    it('should open snackbar when called', () => {
        spyOn(component['snackBar'], 'open');
        component.openSnackBar('message');
        expect(component['snackBar'].open).toHaveBeenCalledWith('message', 'Close', { duration: 4000 });
    });

    it('should refresh games', () => {
        spyOn(component, 'loadGames');
        component.refreshGames();
        expect(component.loadGames).toHaveBeenCalled();
    });
    it('should navigate to loading page when starting a game', () => {
        const game = GAME_PLACEHOLDER;
        spyOn(window, 'alert');
        spyOn(router, 'navigate');

        component.startGame(game);

        expect(router.navigate).toHaveBeenCalledWith(['/loading']);
    });

    it('should navigate to game page when game visibility is true', fakeAsync(() => {
        const game = GAME_PLACEHOLDER;
        game.visibility = true;
        const mockResult = { ok: true, value: game };
        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: true, value: mockResult.value } as Result<Game>));

        spyOn(router, 'navigate');

        component.testGame(game);

        tick();

        expect(router.navigate).toHaveBeenCalledWith(['/game'], { state: { questions: game.questions } });
    }));

    it('should display snack bar message and reload games list when game visibility is false', fakeAsync(() => {
        const game = GAME_PLACEHOLDER;
        game.visibility = false;
        const mockResult = { ok: true, value: game };
        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: true, value: mockResult.value } as Result<Game>));

        spyOn(component, 'openSnackBar');
        spyOn(component, 'loadGames');

        component.testGame(game);

        tick(); // Advance to the next tick to resolve the Observable

        expect(component.openSnackBar).toHaveBeenCalledWith('Jeux invisible, veuillez en choisir un autre');
        expect(component.loadGames).toHaveBeenCalled();
    }));

    it('should display snack bar message and reload games list when game fetch fails', fakeAsync(() => {
        const mockGameId = 'mock-game-id';
        const mockGame = { ...GAME_PLACEHOLDER, gameId: mockGameId };

        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: false, error: 'Error fetching game' } as Result<Game>));

        spyOn(component, 'openSnackBar');
        spyOn(component, 'loadGames');
        component.testGame(mockGame);
        tick();
        expect(component.openSnackBar).toHaveBeenCalledWith('Jeux supprimé, veuillez en choisir un autre');
        expect(component.loadGames).toHaveBeenCalled();
    }));
});
