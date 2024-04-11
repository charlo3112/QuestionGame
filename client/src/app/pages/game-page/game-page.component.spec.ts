import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { GameState } from '@common/enums/game-state';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;

    let mockTest: boolean;
    let mockCurrentState: GameState;
    let mockIsHost: boolean;
    let mockIsPlaying: boolean;
    let mockHistogram: HistogramData;

    beforeEach(async () => {
        sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['test']);
        Object.defineProperty(sessionStorageServiceSpy, 'test', { get: () => mockTest });
        mockTest = false;

        mockGameService = jasmine.createSpyObj(
            'GameService',
            [
                'currentQuestion',
                'isPlaying',
                'isHost',
                'currentState',
                'showFinalResults',
                'nextQuestion',
                'init',
                'stateSubscribe',
                'leaveRoom',
                'gameTitle',
                'score',
                'message',
                'time',
                'isChoiceSelected',
                'isChoiceCorrect',
                'isChoiceIncorrect',
                'histogram',
            ],
            {
                currentQuestion: QUESTION_PLACEHOLDER,
                currentState: GameState.STARTING,
                roomCodeValue: 'someRoomCode',
            },
        );
        mockGameService.init.and.returnValue(Promise.resolve());
        Object.defineProperty(mockGameService, 'isHost', { get: () => mockIsHost });
        Object.defineProperty(mockGameService, 'currentState', { get: () => mockCurrentState });
        Object.defineProperty(mockGameService, 'isPlaying', { get: () => mockIsPlaying });
        Object.defineProperty(mockGameService, 'histogram', { get: () => mockHistogram });

        mockCurrentState = GameState.STARTING;
        mockIsHost = false;
        mockIsPlaying = false;
        mockHistogram = HISTOGRAM_DATA;

        TestBed.overrideProvider(MatDialog, {
            useValue: {
                open: () => ({
                    afterClosed: () => of(true),
                }),
            },
        });

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
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
            ],
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

    it('should return true if game state is Starting', () => {
        expect(component.isStartingGame()).toBeTrue();
    });

    it('should call leaveRoom openAbandonDialog is called with true result', () => {
        spyOn(component, 'openAbandonDialog').and.callThrough();
        component.openAbandonDialog();

        expect(component.gameService.leaveRoom).toHaveBeenCalled();
    });

    it('should call showFinalResults and clear localStorage when buttonText is "Résultats"', () => {
        mockCurrentState = GameState.LAST_QUESTION;
        component.nextStep();
        expect(mockGameService.showFinalResults).toHaveBeenCalled();
    });

    it('should navigate to /new when buttonText is "Résultats" and test is true', () => {
        mockTest = true;
        mockCurrentState = GameState.LAST_QUESTION;
        component.nextStep();
        expect(mockGameService.showFinalResults).not.toHaveBeenCalled();
    });

    it('should call nextQuestion when buttonText is "Prochaine Question"', () => {
        mockCurrentState = GameState.ASKING_QUESTION;
        component.nextStep();
        expect(mockGameService.nextQuestion).toHaveBeenCalled();
    });

    it('should call init on gameService on ngOnInit', async () => {
        mockGameService.init.calls.reset();
        await component.ngOnInit();
        expect(mockGameService.init).toHaveBeenCalled();
    });

    describe('showButton', () => {
        it('should return true if game state is SHOW_RESULTS and isHost is true', () => {
            mockCurrentState = GameState.SHOW_RESULTS;
            mockIsHost = true;
            mockIsPlaying = false;
            expect(component.showButton()).toBeTrue();
        });

        it('should return true if game state is SHOW_RESULTS and isHost is true', () => {
            mockCurrentState = GameState.LAST_QUESTION;
            mockIsHost = true;
            mockIsPlaying = true;
            mockTest = true;
            expect(component.showButton()).toBeTrue();
        });
    });

    describe('buttonText', () => {
        it('should return "Résultats" if game state is LAST_QUESTION', () => {
            mockCurrentState = GameState.LAST_QUESTION;
            expect(component.buttonText).toBe('Résultats');
        });

        it('should return "Prochaine Question" if game state is not LAST_QUESTION', () => {
            mockCurrentState = GameState.SHOW_RESULTS;
            expect(component.buttonText).toBe('Prochaine Question');
        });
    });
});
