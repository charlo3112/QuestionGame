import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AbandonDialogComponent } from '@app/components/abandon-dialog/abandon-dialog.component';
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
            ],
            {
                currentQuestion: QUESTION_PLACEHOLDER,
                currentState: GameState.Starting,
            },
        );
        mockGameService.timerSubscribe.and.returnValue(of(0));
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

    /*
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

    it('should call gameService.showResults when showResults is called', () => {
        component.showResults();
        expect(mockGameService.showResults).toHaveBeenCalled();
    });
    */

    it('should navigate to /new when openAbandonDialog is called with true result', () => {
        spyOn(router, 'navigate');
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(dialogRefSpy);
        component.openAbandonDialog();
        expect(router.navigate).toHaveBeenCalledWith(['/new']);
    });
});
