import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { ResultPageComponent } from './result-page.component';

describe('ResultPageComponent', () => {
    let component: ResultPageComponent;
    let fixture: ComponentFixture<ResultPageComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockGameSubscriptionService: jasmine.SpyObj<GameSubscriptionService>;

    beforeEach(async () => {
        const mockHistogramData: HistogramData = HISTOGRAM_DATA;
        mockGameService = jasmine.createSpyObj('GameService', ['init', 'histogram', 'leaveRoom'], {
            currentQuestion: {
                type: QuestionType.QCM,
                text: "Pourquoi le jus de lichi n'est pas bon?",
                points: 69,
                choices: [
                    { text: 'Guillaume en boit', isCorrect: true },
                    { text: 'Guillaume en a apporté 2 boites', isCorrect: false },
                    { text: "C'est du lichi", isCorrect: false },
                    { text: 'Guillaume en a bu à 9h du matin', isCorrect: false },
                ],
            },
            currentState: GameState.STARTING,
            histogramData: mockHistogramData,
        });
        Object.defineProperty(mockGameService, 'histogram', {
            get: jasmine.createSpy('histogram').and.returnValue(mockHistogramData),
        });
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, BrowserAnimationsModule, NoopAnimationsModule],
            providers: [
                { provide: GameService, useValue: mockGameService },
                { provide: GameSubscriptionService, useValue: mockGameSubscriptionService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ResultPageComponent ngOnDestroy', () => {
        it('should call leaveRoom on GameService', () => {
            component.ngOnDestroy();
            expect(mockGameService.leaveRoom).toHaveBeenCalled();
        });
    });
});
