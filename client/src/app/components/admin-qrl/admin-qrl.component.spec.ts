import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameService } from '@app/services/game/game.service';
import { AdminQrlComponent } from './admin-qrl.component';

describe('AdminQrlComponent', () => {
    let component: AdminQrlComponent;
    let fixture: ComponentFixture<AdminQrlComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['sendGrades', 'currentQuestion']);
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, NoopAnimationsModule],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        });
        fixture = TestBed.createComponent(AdminQrlComponent);
        component = fixture.componentInstance;
        component.answers = [
            { player: 'player1', grade: 0, text: 'answer1' },
            { player: 'player2', grade: 0, text: 'answer2' },
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onGradeChange', () => {
        it('should change the grade of the answer at the given index', () => {
            component.onGradeChange(0, 1);
            expect(component.answers[0].grade).toBe(1);
        });
    });

    describe('sendGrades', () => {
        it('should call sendGrades on gameService', () => {
            component.sendGrades();
            expect(gameServiceSpy.sendGrades).toHaveBeenCalled();
        });

        it('should emit answersCorrected', () => {
            const emitSpy = spyOn(component.answersCorrected, 'emit');
            component.sendGrades();
            expect(emitSpy).toHaveBeenCalled();
        });
    });
});
