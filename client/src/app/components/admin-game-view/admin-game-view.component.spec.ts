import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { MIN_TIME_PANIC_QCM_S, MIN_TIME_PANIC_QRL_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { Message } from '@common/interfaces/message';
import { Question } from '@common/interfaces/question';
import { Subject } from 'rxjs';
import { AdminGameViewComponent } from './admin-game-view.component';

describe('AdminGameViewComponent', () => {
    let component: AdminGameViewComponent;
    let fixture: ComponentFixture<AdminGameViewComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;

    let mockPanic: boolean;
    let mockCurrentQuestion: Question | undefined;
    let mockTime: number;
    let mockCurrentState: GameState;
    const mockMessage: Subject<Message> = new Subject<Message>();
    let mockGameStatePayloadString: Subject<GameStatePayload>;

    beforeEach(() => {
        const mockHistogramData: HistogramData = HISTOGRAM_DATA;
        mockGameStatePayloadString = new Subject<GameStatePayload>();

        mockPanic = false;
        mockCurrentQuestion = undefined;
        mockTime = 0;
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['getState', 'getMessage', 'getMessages']);
        mockGameService = jasmine.createSpyObj('GameService', [
            'init',
            'histogram',
            'startPanic',
            'togglePause',
            'currentQuestion',
            'getMessage',
            'nextQuestion',
            'showFinalResults',
            'getQrlAnswers',
        ]);
        mockGameService.getQrlAnswers.and.returnValue(Promise.resolve([]));
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
        Object.defineProperty(mockGameService, 'currentState', {
            get: jasmine.createSpy('currentState.get').and.callFake(() => mockCurrentState),
        });
        mockCurrentState = GameState.ASKING_QUESTION;
        mockWebSocketService.getMessage.and.returnValue(mockMessage.asObservable());
        mockWebSocketService.getState.and.returnValue(mockGameStatePayloadString.asObservable());
        mockWebSocketService.getMessages.and.returnValue(Promise.resolve([]));
        TestBed.configureTestingModule({
            imports: [AdminGameViewComponent, BrowserAnimationsModule, NoopAnimationsModule, LeaderboardComponent, HistogramComponent, ChatComponent],
            providers: [
                { provide: GameService, useValue: mockGameService },
                { provide: WebSocketService, useValue: mockWebSocketService },
            ],
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

    describe('nextStep', () => {
        it('should call showFinalResults on gameService if currentState is LAST_QUESTION', () => {
            mockCurrentState = GameState.LAST_QUESTION;
            component.nextStep();
            expect(mockGameService.showFinalResults).toHaveBeenCalled();
        });

        it('should call nextQuestion on gameService if currentState is not LAST_QUESTION', () => {
            mockCurrentState = GameState.ASKING_QUESTION;
            component.nextStep();
            expect(mockGameService.nextQuestion).toHaveBeenCalled();
        });
    });

    describe('ngOnInit', () => {
        it('should set currentQuestion if currentQuestion is defined', () => {
            mockCurrentQuestion = { type: QuestionType.QCM, text: 'test', points: 0, choices: [] };
            component.ngOnInit();
            expect(component.currentQuestion).toEqual(mockCurrentQuestion);
        });

        it('should not set currentQuestion if currentQuestion is undefined', () => {
            mockCurrentQuestion = undefined;
            component.ngOnInit();
            expect(component.currentQuestion).toBeUndefined();
        });

        it('should set readyForGrading to true if state is SHOW_RESULTS and currentQuestion is QRL', fakeAsync(() => {
            mockCurrentState = GameState.SHOW_RESULTS;
            mockCurrentQuestion = { type: QuestionType.QRL, text: 'test', points: 0, choices: [] };
            mockGameStatePayloadString.next({ state: GameState.SHOW_RESULTS });
            tick();
            expect(component.readyForGrading).toBeTrue();
        }));

        it('should set readyForGrading to false if state is not SHOW_RESULTS', fakeAsync(() => {
            mockCurrentState = GameState.ASKING_QUESTION;
            mockCurrentQuestion = { type: QuestionType.QCM, text: 'test', points: 0, choices: [] };
            mockGameStatePayloadString.next({ state: GameState.ASKING_QUESTION });
            tick();
            expect(component.readyForGrading).toBeFalse();
        }));
    });

    describe('qrlCorrected', () => {
        it('should emit answersCorrected and set gradesSent to true', () => {
            spyOn(component.answersCorrected, 'emit');
            component.qrlCorrected();
            expect(component.answersCorrected.emit).toHaveBeenCalled();
            expect(component.gradesSent).toBeTrue();
        });
    });

    describe('buttonText', () => {
        it('should return "Résultats" if currentState is LAST_QUESTION', () => {
            mockCurrentState = GameState.LAST_QUESTION;
            expect(component.buttonText).toBe('Résultats');
        });

        it('should return "Prochaine Question" if currentState is not LAST_QUESTION', () => {
            mockCurrentState = GameState.ASKING_QUESTION;
            expect(component.buttonText).toBe('Prochaine Question');
        });
    });
});
