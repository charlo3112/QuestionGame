import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { QuestionType } from '@app/interfaces/question';
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
        component.question = {
            type: QuestionType.Qcm,
            text: 'Question test',
            points: 8,
            choices: [
                { text: 'A', isSelected: false },
                { text: 'B', isSelected: false },
                { text: 'C', isSelected: false },
            ],
        };
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
        expect(component.choices[0].isSelected).toEqual(true);
    });

    it('mouseHitDetect should call startTimer with 5 seconds on left click', () => {
        const mockEvent = { button: 0 } as MouseEvent;
        component.mouseHitDetect(mockEvent);
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timer']);
    });

    it('ngAfterViewInit should call startTimer with correct time', fakeAsync(() => {
        component.ngAfterViewInit();
        tick();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timer']);
    }));

    it('confirmQuestion should call alert with message', () => {
        spyOn(window, 'alert');
        component.confirmQuestion();
        expect(window.alert).toHaveBeenCalledWith('Question confirmée');
    });

    it('chatConfirm should call alert with message', () => {
        spyOn(window, 'alert');
        component.chatConfirm();
        expect(window.alert).toHaveBeenCalledWith('Bienvenu au chat');
    });

    it('score should return 3', () => {
        expect(component.score).toEqual(3);
    });

    it('time should return timeService.time', () => {
        expect(component.time).toEqual(timeServiceSpy.time);
    });

    it('should populate choices when question input is provided', () => {
        expect(component.choices).toEqual(mockQuestion.choices);
    });
});
