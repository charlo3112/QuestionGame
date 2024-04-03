import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { GAME_PLACEHOLDER, Game } from '@common/interfaces/game';
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
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGames', 'getGameByID']);
        communicationServiceSpy.getGames.and.returnValue(of({ ok: true, value: [GAME_PLACEHOLDER] } as Result<Game[]>));
        mockGameService = jasmine.createSpyObj('GameService', ['leaveRoom', 'reset', 'startGame', 'startRandomGame', 'testGame']);
        mockGameService.testGame.and.returnValue(Promise.resolve(true));
        mockGameService.startGame.and.returnValue(Promise.resolve(true));
        mockGameService.startRandomGame.and.returnValue(Promise.resolve(true));

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

    it('should show snackbar when error occurs during loadGames', async () => {
        communicationServiceSpy.getGames.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        spyOn(component, 'openSnackBar');
        await component.loadGames();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should show snackbar when loadGames is called and is not ok', async () => {
        communicationServiceSpy.getGames.and.returnValue(of({ ok: false } as Result<Game[]>));
        spyOn(component, 'openSnackBar');
        await component.loadGames();
        expect(component.openSnackBar).toHaveBeenCalledWith("Erreur lors de l'obtention des jeux");
    });

    it('should load games when loadGames is called and is ok', async () => {
        communicationServiceSpy.getGames.and.returnValue(of({ ok: true, value: [GAME_PLACEHOLDER] } as Result<Game[]>));
        await component.loadGames();
        expect(component.games).toEqual([GAME_PLACEHOLDER]);
    });

    it('should show snackbar when error occurs during verifyRandomGame', async () => {
        communicationServiceSpy.canCreateRandom.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        spyOn(component, 'openSnackBar');
        await component.verifyRandomGame();
        expect(component.openSnackBar).toHaveBeenCalled();
    });

    it('should show snackbar when testGame is failed', async () => {
        mockGameService.testGame.and.returnValue(Promise.resolve(false));
        spyOn(component, 'openSnackBar');
        spyOn(component, 'loadGames');
        component.testGame(GAME_PLACEHOLDER);
        expect(component.openSnackBar).toHaveBeenCalled();
        expect(component.loadGames).toHaveBeenCalled();
    });

    it('should start game when testGame is successful', async () => {
        spyOn(component, 'loadGames');
        component.testGame(GAME_PLACEHOLDER);
        expect(component.loadGames).not.toHaveBeenCalled();
    });

    it('should start game when startGame is successful', async () => {
        spyOn(component, 'loadGames');
        component.startGame(GAME_PLACEHOLDER);
        expect(component.loadGames).not.toHaveBeenCalled();
    });

    it('should show snackbar when startGame is failed', async () => {
        mockGameService.startGame.and.returnValue(Promise.resolve(false));
        spyOn(component, 'openSnackBar');
        spyOn(component, 'loadGames');
        component.startGame(GAME_PLACEHOLDER);
        expect(component.openSnackBar).toHaveBeenCalled();
        expect(component.loadGames).toHaveBeenCalled();
    });

    it('should start random game when canCreateRandom is true', async () => {
        component.canCreateRandom = true;
        spyOn(component, 'verifyRandomGame');
        component.startRandomGame();
        expect(component.verifyRandomGame).not.toHaveBeenCalled();
    });

    it('should show snackbar when startRandomGame is failed', async () => {
        component.canCreateRandom = false;
        spyOn(component, 'openSnackBar');
        spyOn(component, 'verifyRandomGame');
        component.startRandomGame();
        expect(component.openSnackBar).toHaveBeenCalled();
        expect(component.verifyRandomGame).toHaveBeenCalled();
    });

    it('should show snackbar when startRandomGame is failed', async () => {
        component.canCreateRandom = false;
        spyOn(component, 'openSnackBar');
        spyOn(component, 'verifyRandomGame');
        component.startRandomGame();
        expect(component.openSnackBar).toHaveBeenCalled();
        expect(component.verifyRandomGame).toHaveBeenCalled();
    });
});
