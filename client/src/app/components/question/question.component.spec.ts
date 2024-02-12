import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuestionComponent } from '@app/components/question/question.component';
import { Choice } from '@app/classes/choice';
import { Router } from '@angular/router';
import { routes } from '@app/modules/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { GameService } from '@app/services/game.service';
import { QuestionType } from '@common/constants';

const mockQuestion = {
    type: QuestionType.QCM,
    text: 'Question test',
    points: 8,
    choices: [new Choice('A', true), new Choice('B', false), new Choice('C', false)],
};

describe('Question', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let router: Router;
    let location: Location;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['confirmQuestion', 'selectChoice', 'isChoiceCorrect', 'isChoiceIncorrect']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), BrowserAnimationsModule],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.question = mockQuestion;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate on abandon', fakeAsync(() => {
        fixture.debugElement.query(By.css('#abandon-button')).nativeElement.click();
        tick();
        expect(location.path()).toBe('/home');
    }));

    it('should detect enter key', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(event);
        expect(gameServiceSpy.confirmQuestion).toHaveBeenCalled();
    });

    it('should detect number key', () => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.buttonDetect(event);
        expect(gameServiceSpy.selectChoice).toHaveBeenCalledWith(0);
    });

    it('should not detect number key', () => {
        const event = new KeyboardEvent('keydown', { key: '0' });
        component.buttonDetect(event);
        expect(gameServiceSpy.selectChoice).not.toHaveBeenCalled();
    });

    it('should not detect when chat is focused', () => {
        component.chatFocused(true);
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.buttonDetect(event);
        expect(gameServiceSpy.selectChoice).not.toHaveBeenCalled();
    });
});
