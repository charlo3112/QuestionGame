import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameState } from '@common/enums/game-state';
import { GAME_PLACEHOLDER, Game } from '@common/interfaces/game';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';
import { of, throwError } from 'rxjs';
import { StartGamePageComponent } from './startgame-page.component';
import SpyObj = jasmine.SpyObj;

describe('StartGamePageComponent', () => {
    let component: StartGamePageComponent;
    let fixture: ComponentFixture<StartGamePageComponent>;
    let router: Router;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let snackBarSpy: SpyObj<MatSnackBar>;
    let webSocketServiceSpy: SpyObj<WebSocketService>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['createRoom']);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGames', 'getGameByID']);
        communicationServiceSpy.getGames.and.returnValue(of({ ok: true, value: [GAME_PLACEHOLDER] } as Result<Game[]>));
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
                'reset',
            ],
            {
                currentQuestion: QUESTION_PLACEHOLDER,
                currentState: GameState.Starting,
            },
        );
        mockGameService.timerSubscribe.and.returnValue(of(0));
        const mockGame: Game = {
            gameId: '123',
            visibility: true,
            title: 'Titre du jeu',
            description: 'Description du jeu',
            duration: 30,
            lastModification: '2021-06-01T00:00:00.000Z',
            questions: [],
        };
        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: true, value: mockGame }));
        webSocketServiceSpy.createRoom.and.returnValue(
            Promise.resolve({
                userId: 'user123',
                roomId: 'room123',
                name: 'User Name',
            }),
        );

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
                { provide: GameService, useValue: mockGameService },
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
        expect(component.openSnackBar).toHaveBeenCalledWith("Erreur lors de l'obtention des jeux");
    }));

    it('should have a list of games', () => {
        expect(component.games.length).toBeGreaterThan(0);
    });

    it('should open snackbar when called', () => {
        spyOn(component['snackBar'], 'open');
        component.openSnackBar('message');
        expect(component['snackBar'].open).toHaveBeenCalledWith('message', 'Close', { duration: 4000 });
    });

    it('should navigate to game page when testing and game visibility is true', fakeAsync(() => {
        const game = structuredClone(GAME_PLACEHOLDER);
        game.visibility = true;
        const mockResult = { ok: true, value: game };
        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: true, value: mockResult.value } as Result<Game>));

        spyOn(router, 'navigate');

        component.testGame(game);

        tick();

        expect(router.navigate).toHaveBeenCalledWith(['/game'], { state: { game } });
    }));

    it('should display snack bar message and reload games list when testing and game visibility is false', fakeAsync(() => {
        const game = GAME_PLACEHOLDER;
        game.visibility = false;
        const mockResult = { ok: true, value: game };
        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: true, value: mockResult.value } as Result<Game>));

        spyOn(component, 'openSnackBar');
        spyOn(component, 'loadGames');

        component.testGame(game);

        tick();

        expect(component.openSnackBar).toHaveBeenCalledWith('Jeux invisible, veuillez en choisir un autre');
        expect(component.loadGames).toHaveBeenCalled();
    }));

    it('should display snack bar message and reload games list when starting and game visibility is false', fakeAsync(() => {
        const game = GAME_PLACEHOLDER;
        game.visibility = false;
        const mockResult = { ok: true, value: game };
        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: true, value: mockResult.value } as Result<Game>));

        spyOn(component, 'openSnackBar');
        spyOn(component, 'loadGames');
        component.startGame(game);
        tick();
        expect(component.openSnackBar).toHaveBeenCalledWith('Jeux invisible, veuillez en choisir un autre');
        expect(component.loadGames).toHaveBeenCalled();
    }));

    it('should display snack bar message and reload games list when testing and game fetch fails', fakeAsync(() => {
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

    it('should display snack bar message and reload games list when starting and game fetch fails', fakeAsync(() => {
        const mockGameId = 'mock-game-id';
        const mockGame = { ...GAME_PLACEHOLDER, gameId: mockGameId };

        communicationServiceSpy.getGameByID.and.returnValue(of({ ok: false, error: 'Error fetching game' } as Result<Game>));

        spyOn(component, 'openSnackBar');
        spyOn(component, 'loadGames');
        component.startGame(mockGame);
        tick();
        expect(component.openSnackBar).toHaveBeenCalledWith('Jeux supprimé, veuillez en choisir un autre');
        expect(component.loadGames).toHaveBeenCalled();
    }));

    /*
    it('should call webSocketService.createRoom if newGame.visibility is true', fakeAsync(() => {
        const navigateSpy = spyOn(router, 'navigate');
        component.startGame({ gameId: '123', visibility: true } as Game);
        tick();
        expect(navigateSpy).toHaveBeenCalledWith(['/loading']);
    }));
    */
});
