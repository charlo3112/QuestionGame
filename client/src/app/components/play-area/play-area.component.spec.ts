import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { QuestionType } from '@app/enums/question-type';
import { TimeService } from '@app/services/time.service';
import SpyObj = jasmine.SpyObj;

const mockQuestion = {
    type: QuestionType.Qcm,
    text: 'Question test',
    points: 8,
    choices: [
        { text: 'A', isSelected: false },
        { text: 'B', isSelected: false },
        { text: 'C', isSelected: false },
    ],
};

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        await TestBed.configureTestingModule({
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        component.question = mockQuestion;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('buttonDetect with 1 should select first element', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.question.choices[0].isSelected).toEqual(true);
    });

    it('confirmQuestion should call alert with message', () => {
        spyOn(window, 'alert');
        component.confirmQuestion();
        expect(window.alert).toHaveBeenCalledWith('Question confirmée');
    });

    it('score should return 3', () => {
        expect(component.score).toEqual(3);
    });

    it('time should return timeService.time', () => {
        expect(component.time).toEqual(timeServiceSpy.time);
    });
});
