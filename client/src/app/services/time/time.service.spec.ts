import { TestBed } from '@angular/core/testing';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { TimeData } from '@common/interfaces/time-data';
import { Subject } from 'rxjs';
import { TimeService } from './time.service';

describe('TimeService', () => {
    let service: TimeService;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let timeUpdateSubject: Subject<TimeData>;
    let mockAudio: jasmine.SpyObj<HTMLAudioElement>;

    beforeEach(() => {
        timeUpdateSubject = new Subject<TimeData>();
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['getTime']);
        mockWebSocketService.getTime.and.returnValue(timeUpdateSubject.asObservable());
        mockAudio = jasmine.createSpyObj('HTMLAudioElement', ['play', 'pause']);
        spyOn(window, 'Audio').and.returnValue(mockAudio);
        TestBed.configureTestingModule({
            providers: [TimeService, { provide: WebSocketService, useValue: mockWebSocketService }],
        });
        service = TestBed.inject(TimeService);
    });

    it('should update serverTime and maxTime on time data emission', () => {
        const timeData: TimeData = { seconds: 30, timeInit: 60, panicMode: false, pause: false };
        timeUpdateSubject.next(timeData);
        expect(service.serverTime).toEqual(timeData.seconds);
        expect(service.maxTime).toEqual(timeData.timeInit);
    });

    it('should enter panic mode and play audio when panic mode is true and not paused', () => {
        const timeData: TimeData = { seconds: 30, timeInit: 60, panicMode: true, pause: false };
        timeUpdateSubject.next(timeData);
        expect(service.panicMode).toBeTrue();
        expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should pause audio and not enter panic mode when pause is true', () => {
        const timeData: TimeData = { seconds: 30, timeInit: 60, panicMode: true, pause: true };
        timeUpdateSubject.next(timeData);
        expect(service.pause).toBeTrue();
        expect(mockAudio.pause).toHaveBeenCalled();
        expect(service.panicMode).toBeTrue();
    });

    it('should reset audio and not play when transitioning from panic mode to non-panic', () => {
        service.panicMode = true;
        const timeData: TimeData = { seconds: 30, timeInit: 60, panicMode: false, pause: false };
        timeUpdateSubject.next(timeData);
        expect(service.panicMode).toBeFalse();
        expect(mockAudio.currentTime).toBe(0);
        expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should resume audio play when unpausing if in panic mode', () => {
        service.pause = true;
        service.panicMode = true;
        const timeData: TimeData = { seconds: 30, timeInit: 60, panicMode: true, pause: false };
        timeUpdateSubject.next(timeData);
        expect(service.pause).toBeFalse();
        expect(mockAudio.play).toHaveBeenCalled();
    });

    it('reset should set proper initial values and pause audio', () => {
        service.reset();
        expect(service.panicMode).toBeFalse();
        expect(service.pause).toBeFalse();
        expect(service.serverTime).toBe(0);
        expect(service.maxTime).toBe(0);
        expect(mockAudio.pause).toHaveBeenCalled();
        expect(mockAudio.currentTime).toBe(0);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });
});
