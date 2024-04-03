import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { Game } from '@common/interfaces/game';
import { of, throwError } from 'rxjs';
import { StartGamePageComponent } from './startgame-page.component';

describe('StartGamePageComponent', () => {
    let component: StartGamePageComponent;
    let fixture: ComponentFixture<StartGamePageComponent>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['getGames', 'canCreateRandom']);
        mockGameService = jasmine.createSpyObj('GameService', ['reset', 'leaveRoom', 'startGame', 'startRandomGame', 'testGame']);

        TestBed.configureTestingModule({
            imports: [
                StartGamePageComponent,
                CommonModule,
                MatButtonModule,
                MatExpansionModule,
                StartGameExpansionComponent,
                MatToolbarModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
            ],
            providers: [
                MatSnackBar,
                { provide: CommunicationService, useValue: mockCommunicationService },
                { provide: GameService, useValue: mockGameService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(StartGamePageComponent);
        component = fixture.componentInstance;
        mockCommunicationService.getGames.and.returnValue(of({ ok: true, value: [] }));
        mockCommunicationService.canCreateRandom.and.returnValue(of(true));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games and verify random game on init', async () => {
        await component.ngOnInit();
        expect(mockCommunicationService.getGames).toHaveBeenCalled();
        expect(mockCommunicationService.canCreateRandom).toHaveBeenCalled();
        expect(mockGameService.reset).toHaveBeenCalled();
        expect(mockGameService.leaveRoom).toHaveBeenCalled();
    });

    it('should handle errors when loading games', async () => {
        mockCommunicationService.getGames.and.returnValue(throwError(() => new Error('Failed to load games')));
        spyOn(component['snackBar'], 'open');
        await component.loadGames();
        expect(component['snackBar'].open).toHaveBeenCalledWith("Erreur lors de l'obtention des jeux", undefined, jasmine.any(Object));
    });

    it('should handle errors when verifying random game', async () => {
        mockCommunicationService.canCreateRandom.and.returnValue(throwError(() => new Error('Verification failed')));
        spyOn(component['snackBar'], 'open');
        await component.verifyRandomGame();
        expect(component['snackBar'].open).toHaveBeenCalledWith(
            'Erreur lors de la vérification de la création de jeu aléatoire',
            undefined,
            jasmine.any(Object),
        );
    });

    it('should not start random game if canCreateRandom is false', async () => {
        mockCommunicationService.canCreateRandom.and.returnValue(of(false));
        spyOn(component['snackBar'], 'open');
        await component.startRandomGame();
        expect(mockGameService.startRandomGame).not.toHaveBeenCalled();
        expect(component['snackBar'].open).toHaveBeenCalledWith('Impossible de créer un jeu aléatoire', undefined, jasmine.any(Object));
    });

    it('should reload games if starting a game fails', async () => {
        mockGameService.startGame.and.returnValue(Promise.resolve(false));
        await component.startGame({} as Game);
        expect(mockCommunicationService.getGames).toHaveBeenCalled();
    });

    it('should reload games if testing a game fails', async () => {
        mockGameService.testGame.and.returnValue(Promise.resolve(false));
        await component.testGame({} as Game);
        expect(mockCommunicationService.getGames).toHaveBeenCalled();
    });
});
