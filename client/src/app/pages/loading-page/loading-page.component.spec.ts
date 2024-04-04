import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { GameService } from '@app/services/game/game.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { of } from 'rxjs';
import { LoadingPageComponent } from './loading-page.component';

describe('LoadingPageComponent', () => {
    let component: LoadingPageComponent;
    let fixture: ComponentFixture<LoadingPageComponent>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let router: Router;

    beforeEach(async () => {
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['toggleClosed', 'launchGame', 'getMessage', 'getMessages', 'hostConfirm']);
        mockWebSocketService.getMessage.and.returnValue(
            of({
                name: 'Test',
                message: 'This is a test message',
                timestamp: Date.now(),
            }),
        );
        mockWebSocketService.getMessages.and.returnValue(
            Promise.resolve([
                {
                    name: 'Test',
                    message: 'This is a test message',
                    timestamp: Date.now(),
                },
            ]),
        );
        mockGameService = jasmine.createSpyObj('GameService', ['reset', 'init', 'leaveRoom']);
        TestBed.configureTestingModule({
            imports: [LoadingPageComponent, RouterModule.forRoot(routes), BrowserAnimationsModule, NoopAnimationsModule, RouterTestingModule],
            providers: [
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: GameService, useValue: mockGameService },
            ],
        });

        fixture = TestBed.createComponent(LoadingPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        router.initialNavigation();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call GameService.init on init', fakeAsync(() => {
        expect(mockGameService.init.calls.any()).toBeTrue();
    }));

    it('should call GameService.leaveRoom on destroy', () => {
        spyOn(component, 'ngOnDestroy').and.callThrough();
        component.ngOnDestroy();
        expect(component.ngOnDestroy).toHaveBeenCalled();
        expect(mockGameService.leaveRoom.calls.any()).toBeTrue();
    });

    it('should toggle room lock state', () => {
        const initialLockState = component.roomLocked;
        component.onToggleLock();
        expect(component.roomLocked).toBe(!initialLockState);
        expect(mockWebSocketService.toggleClosed).toHaveBeenCalledWith(!initialLockState);
    });

    it('should start game on button click', () => {
        component.onStartGame();
        expect(mockWebSocketService.hostConfirm.calls.any()).toBeTrue();
    });
});
