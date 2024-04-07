import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { Question } from '@common/interfaces/question';
import { AdminGameViewComponent } from './admin-game-view.component';

describe('AdminGameViewComponent', () => {
    let component: AdminGameViewComponent;
    let fixture: ComponentFixture<AdminGameViewComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;

    let mockPanic: boolean;
    let mockCurrentQuestion: Question | undefined;
    let mockTime: number;

    beforeEach(() => {
        const mockHistogramData: HistogramData = HISTOGRAM_DATA;

        mockPanic = false;
        mockCurrentQuestion = undefined;
        mockTime = 0;
        mockGameService = jasmine.createSpyObj('GameService', ['init', 'histogram', 'startPanic', 'togglePause'], {
            currentState: GameState.Starting,
        });
        Object.defineProperty(mockGameService, 'histogram', {
            get: jasmine.createSpy('histogram').and.returnValue(mockHistogramData),
        });
        Object.defineProperty(mockGameService, 'panic', {
            get: jasmine.createSpy('panic.get').and.callFake(() => mockPanic),
        });
        Object.defineProperty(mockGameService, 'currentQuestion', {
            get: jasmine.createSpy('currentQuestion.get').and.callFake(() => mockCurrentQuestion),
        });
        Object.defineProperty(mockGameService, 'time', {
            get: jasmine.createSpy('time.get').and.callFake(() => mockTime),
        });
        TestBed.configureTestingModule({
            imports: [AdminGameViewComponent, BrowserAnimationsModule, NoopAnimationsModule, LeaderboardComponent, HistogramComponent, ChatComponent],
            providers: [{ provide: GameService, useValue: mockGameService }],
        });
        fixture = TestBed.createComponent(AdminGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('canPanic', () => {
        it('should return false if panic is true', () => {
            mockPanic = true;
            expect(component.canPanic()).toBeFalse();
        });

        it('should return false if currentQuestion is undefined', () => {
            mockPanic = false;
            mockCurrentQuestion = undefined;
            expect(component.canPanic()).toBeFalse();
        });

        it('should return true', () => {
            mockPanic = false;
            mockCurrentQuestion = { type: QuestionType.QCM, text: 'test', points: 0, choices: [] };
            mockTime = MIN_TIME_PANIC_QCM_S + 1;
            expect(component.canPanic()).toBeTrue();
        });

        it('should return true', () => {
            mockPanic = false;
            mockCurrentQuestion = { type: QuestionType.QRL, text: 'test', points: 0, choices: [] };
            mockTime = MIN_TIME_PANIC_QRL_S + 1;
            expect(component.canPanic()).toBeTrue();
        });
    });

    describe('togglePause', () => {
        it('should call togglePause on gameService', () => {
            component.togglePause();
            expect(mockGameService.togglePause).toHaveBeenCalled();
        });
    });

    describe('startPanicking', () => {
        it('should do nothing if canPanic is false', () => {
            spyOn(component, 'canPanic').and.returnValue(false);
            component.startPanicking();
            expect(mockGameService.startPanic).not.toHaveBeenCalled();
        });

        it('should call startPanic on gameService if canPanic is true', () => {
            spyOn(component, 'canPanic').and.returnValue(true);
            component.startPanicking();
            expect(mockGameService.startPanic).toHaveBeenCalled();
        });
    });
});
