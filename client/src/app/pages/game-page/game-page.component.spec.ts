import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let router: Router;

    beforeEach(async () => {
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
                'roomCodeValue',
                'showFinalResults',
                'nextQuestion',
            ],
            {
                currentQuestion: QUESTION_PLACEHOLDER,
                currentState: GameState.Starting,
                roomCodeValue: 'someRoomCode',
            },
        );
        mockGameService.init.and.returnValue(Promise.resolve());

        mockGameService.timerSubscribe.and.returnValue(of(0));
        mockGameService.stateSubscribe.and.returnValue(of({ state: GameState.Starting, payload: undefined }));
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                RouterLink,
                RouterModule.forRoot(routes),
                BrowserAnimationsModule,
                GamePageComponent,
                AbandonDialogComponent,
            ],
            providers: [
                { provide: GameService, useValue: mockGameService },
                { provide: MatDialog, useValue: mockMatDialog },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        Object.defineProperties(window, { history: { value: { state: {} } } });
        router = TestBed.inject(Router);
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

    it('should navigate to /new when openAbandonDialog is called with true result', () => {
        spyOn(router, 'navigate');
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(dialogRefSpy);
        component.openAbandonDialog();
        expect(router.navigate).toHaveBeenCalledWith(['/new']);
    });

    it('should save game data to localStorage', () => {
        const testButtonText = 'Test Button Text';
        spyOn(localStorage, 'setItem');
        component.saveGameData(testButtonText);
        expect(localStorage.setItem).toHaveBeenCalledWith('someRoomCode', JSON.stringify({ buttonText: testButtonText }));
    });

    it('should call showFinalResults and clear localStorage when buttonText is "Résultats"', () => {
        spyOn(localStorage, 'clear');
        component.buttonText = 'Résultats';
        component.nextStep();
        expect(mockGameService.showFinalResults).toHaveBeenCalled();
        expect(localStorage.clear).toHaveBeenCalled();
    });

    it('should call nextQuestion when buttonText is "Prochaine Question"', () => {
        component.buttonText = 'Prochaine Question';
        component.nextStep();
        expect(mockGameService.nextQuestion).toHaveBeenCalled();
    });

    it('should set buttonText to value from localStorage', async () => {
        mockGameService.stateSubscribe.and.returnValue(of({ state: GameState.LastQuestion }));
        const buttonText = 'Résultats';
        spyOn(component, 'getGameData').and.returnValue({ buttonText });
        await component.ngOnInit();
        expect(component.buttonText).toEqual(buttonText);
    });
});
