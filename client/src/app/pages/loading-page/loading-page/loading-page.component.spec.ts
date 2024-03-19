import { Location } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameState } from '@common/game-state';
import { Message } from '@common/message.interface';
import { Result } from '@common/result';
import { UserConnectionUpdate } from '@common/user-update.interface';
import { of } from 'rxjs';
import { LoadingPageComponent } from './loading-page.component';

describe('LoadingPageComponent', () => {
    let component: LoadingPageComponent;
    let fixture: ComponentFixture<LoadingPageComponent>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let router: Router;
    let location: Location;

    beforeEach(() => {
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', [
            'getClosedConnection',
            'getUserUpdate',
            'rejoinRoom',
            'getMessage',
            'getMessages',
            'joinRoom',
            'leaveRoom',
            'getUsers',
            'toggleClosed',
            'launchGame',
            'banUser',
        ]);
        mockWebSocketService.getMessage.and.returnValue(of({} as Message));
        mockWebSocketService.getClosedConnection.and.returnValue(of(''));
        mockWebSocketService.getUserUpdate.and.returnValue(of({} as UserConnectionUpdate));
        mockWebSocketService.rejoinRoom.and.returnValue(Promise.resolve({ ok: true, value: GameState.Wait } as Result<GameState>));
        mockWebSocketService.getUsers.and.returnValue(Promise.resolve(['User1', 'User2']));
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            imports: [LoadingPageComponent, RouterModule.forRoot(routes), BrowserAnimationsModule, NoopAnimationsModule, RouterTestingModule],
            providers: [
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });
        fixture = TestBed.createComponent(LoadingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to root if no user data in session storage', fakeAsync(() => {
        sessionStorage.removeItem('user');
        component.ngOnInit();
        tick();
        expect(location.path()).toBe('/home');
    }));

    it('should navigate to root if rejoinRoom fails', fakeAsync(() => {
        sessionStorage.setItem('user', JSON.stringify({ name: 'test', roomId: '1234' }));
        mockWebSocketService.rejoinRoom.and.returnValue(Promise.resolve({ ok: false, error: 'error' }));
        component.ngOnInit();
        tick();
        expect(location.path()).toBe('/home');
        expect(snackBarSpy.open).toHaveBeenCalled();
    }));

    it('should successfully rejoin room and update user list', fakeAsync(() => {
        const testUser = { name: 'test', roomId: '1234' };
        sessionStorage.setItem('user', JSON.stringify(testUser));

        component.ngOnInit();
        tick();

        expect(location.path()).toBe('');
        expect(component.players.size).toBe(2);
        expect(component.players.has('User1')).toBeTrue();
        expect(component.players.has('User2')).toBeTrue();
        expect(component.roomCode).toBe('1234');
        expect(component.username).toBe('test');
    }));

    it('should set isHost to true if username is "Organisateur"', fakeAsync(() => {
        const testUser = { name: 'Organisateur', roomId: '1234' };
        sessionStorage.setItem('user', JSON.stringify(testUser));

        component.ngOnInit();
        tick();

        expect(component.isHost).toBeTrue();
    }));

    it('should add new player on user update (connected)', fakeAsync(() => {
        const userUpdate: UserConnectionUpdate = { isConnected: true, username: 'NewUser' };
        mockWebSocketService.getUserUpdate.and.returnValue(of(userUpdate));

        component.ngOnInit();
        tick();
        component['subscribeToUserUpdate']();
        expect(component.players.has('NewUser')).toBeTrue();
    }));
    /*
    it('should remove player on user update (disconnected)', fakeAsync(() => {
        const userUpdate: UserConnectionUpdate = { isConnected: false, username: 'User1' };
        mockWebSocketService.getUserUpdate.and.returnValue(of(userUpdate));

        component.ngOnInit();
        tick();
        component['subscribeToUserUpdate']();
        expect(component.players.has('User1')).toBeFalse();
        expect(component.players.size).toBe(1);
    }));
    */

    it('should display snackbar and navigate to root on closed connection', fakeAsync(() => {
        mockWebSocketService.getClosedConnection.and.returnValue(of('test message'));

        component.ngOnInit();
        tick();
        component['subscribeToClosedConnection']();
        tick();
        expect(snackBarSpy.open).toHaveBeenCalled();
        expect(location.path()).toBe('/home');
    }));

    it('should toggle room lock', () => {
        component.onToggleLock();
        expect(mockWebSocketService.toggleClosed).toHaveBeenCalled();
    });

    it('should launch game', () => {
        component.onStartGame();
        expect(mockWebSocketService.launchGame).toHaveBeenCalled();
    });

    it('should kick player', () => {
        component.onKickPlayer('User1');
        expect(mockWebSocketService.banUser).toHaveBeenCalledWith('User1');
    });
});
