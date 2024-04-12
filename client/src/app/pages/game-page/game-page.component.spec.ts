import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    let mockCurrentState: GameState;
    let mockIsHost: boolean;
    let mockIsPlaying: boolean;
    let mockHistogram: HistogramData;

    beforeEach(async () => {
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
                currentState: GameState.Starting,
                roomCodeValue: 'someRoomCode',
            },
        );
        mockGameService.init.and.returnValue(Promise.resolve());
        Object.defineProperty(mockGameService, 'isHost', { get: () => mockIsHost });
        Object.defineProperty(mockGameService, 'currentState', { get: () => mockCurrentState });
        Object.defineProperty(mockGameService, 'isPlaying', { get: () => mockIsPlaying });
        Object.defineProperty(mockGameService, 'histogram', { get: () => mockHistogram });

        mockCurrentState = GameState.Starting;
        mockIsHost = false;
        mockIsPlaying = false;
        mockHistogram = HISTOGRAM_DATA;

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
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(dialogRefSpy);
        component.openAbandonDialog();

        expect(component.gameService.leaveRoom).toHaveBeenCalled();
    });

    it('should call init on gameService on ngOnInit', async () => {
        mockGameService.init.calls.reset();
        await component.ngOnInit();
        expect(mockGameService.init).toHaveBeenCalled();
    });
});
