import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { HISTOGRAM_DATA, HistogramData } from '@common/interfaces/histogram-data';
import { AdminGameViewComponent } from './admin-game-view.component';

describe('AdminGameViewComponent', () => {
    let component: AdminGameViewComponent;
    let fixture: ComponentFixture<AdminGameViewComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        const mockHistogramData: HistogramData = HISTOGRAM_DATA;
        mockGameService = jasmine.createSpyObj('GameService', ['init', 'histogram'], {
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
            currentState: GameState.Starting,
            histogramData: mockHistogramData,
        });
        Object.defineProperty(mockGameService, 'histogram', {
            get: jasmine.createSpy('histogram').and.returnValue(mockHistogramData),
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
});
