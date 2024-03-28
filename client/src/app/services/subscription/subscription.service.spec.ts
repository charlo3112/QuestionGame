import { TestBed } from '@angular/core/testing';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
    let service: SubscriptionService;
    let websocketServiceMock: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('WebSocketService', ['send', 'receive', 'getState', 'getTime']);

        TestBed.configureTestingModule({
            providers: [SubscriptionService, { provide: WebSocketService, useValue: spy }],
        });

        service = TestBed.inject(SubscriptionService);
        websocketServiceMock = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call websocketService.getState', () => {
        service.stateSubscribe();
        expect(websocketServiceMock.getState).toHaveBeenCalled();
    });

    it('should call websocketService.getTime', () => {
        service.timerSubscribe();
        expect(websocketServiceMock.getTime).toHaveBeenCalled();
    });
});
