import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimeService } from '@app/services/time.service';
import SpyObj = jasmine.SpyObj;

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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
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
});
