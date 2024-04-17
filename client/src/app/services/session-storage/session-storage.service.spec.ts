import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Result } from '@common/interfaces/result';
import { User } from '@common/interfaces/user';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
    let service: SessionStorageService;
    let mockStore: Record<string, string | null>;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        websocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['rejoinRoom'], { id: 'websocketId' });
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            providers: [
                SessionStorageService,
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: websocketServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });

        service = TestBed.inject(SessionStorageService);

        mockStore = {};
        spyOn(sessionStorage, 'getItem').and.callFake((key) => mockStore[key] || null);
        spyOn(sessionStorage, 'setItem').and.callFake((key, value) => (mockStore[key] = value));
        spyOn(sessionStorage, 'removeItem').and.callFake((key) => delete mockStore[key]);
    });

    describe('test property', () => {
        it('sets and gets the test state correctly', () => {
            service.test = true;
            expect(service.test).toBeTrue();
            expect(sessionStorage.getItem('test')).toBe('true');
            service.test = false;
            expect(service.test).toBeFalse();
            expect(sessionStorage.getItem('test')).toBe('false');
        });
    });

    describe('user property', () => {
        it('sets and gets user correctly, navigates when undefined', () => {
            const user = { name: 'TestUser', roomId: 'room123', play: true } as User;
            service.user = user;
            expect(service.user).toEqual(user);
            expect(sessionStorage.getItem('user')).toBe(JSON.stringify(user));

            expect(service.username).toBe(user.name);
            expect(service.roomId).toBe(user.roomId);
            expect(service.play).toBe(user.play);

            service.user = undefined;
            expect(sessionStorage.getItem('user')).toBe(JSON.stringify(user));
        });

        it('navigates when user is undefined', () => {
            sessionStorage.removeItem('user');
            expect(service.user).toBeUndefined();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);

            expect(service.username).toBe('');
            expect(service.roomId).toBe('');
            expect(service.play).toBeFalse();
        });
    });

    describe('login property', () => {
        it('sets and gets the login state correctly', () => {
            service.login = true;
            expect(service.login).toBeTrue();
            service.login = false;
            expect(service.login).toBeFalse();
        });

        it('should return false when login is not set', () => {
            sessionStorage.removeItem('login');
            expect(service.login).toBeFalse();
        });
    });

    describe('initUser', () => {
        it('should return error result if no user in sessionStorage', async () => {
            websocketServiceSpy.rejoinRoom.and.resolveTo({ ok: false, error: 'Error' });
            const result: Result<GameStatePayload> = await service.initUser();
            expect(result.ok).toBeFalse();
            if (!result.ok) {
                expect(result.error).toEqual('No user found');
            }
        });

        it('should redirect to home if there is an error in rejoining when not testing', async () => {
            service.user = { name: 'TestUser', roomId: 'room123', play: true } as User;
            websocketServiceSpy.rejoinRoom.and.resolveTo({ ok: false, error: 'Error' });
            await service.initUser();
            expect(snackBarSpy.open).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        });

        it('should redirect to new if there is an error in rejoining when testing', async () => {
            service.test = true;
            service.user = { name: 'TestUser', roomId: 'room123', play: true } as User;
            websocketServiceSpy.rejoinRoom.and.resolveTo({ ok: false, error: 'Error' });
            await service.initUser();
            expect(snackBarSpy.open).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/new']);
        });

        it('should return result if rejoining is successful', async () => {
            service.user = { name: 'TestUser', roomId: 'room123', play: true } as User;
            websocketServiceSpy.rejoinRoom.and.resolveTo({ ok: true, value: {} as GameStatePayload });
            const result: Result<GameStatePayload> = await service.initUser();
            expect(result.ok).toBeTrue();
            expect(service.user.userId).toBe('websocketId');
        });
    });

    describe('removeUser', () => {
        it('removes user, gameData, and test from sessionStorage', () => {
            service.removeUser();
            expect(sessionStorage.getItem('user')).toBeNull();
            expect(sessionStorage.getItem('test')).toBeNull();
        });
    });
});
