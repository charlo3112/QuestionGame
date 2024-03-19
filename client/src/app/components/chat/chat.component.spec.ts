import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameService } from '@app/services/game.service';
import { WebSocketService } from '@app/services/websocket.service';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { Message } from '@common/interfaces/message';
import { QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { of } from 'rxjs';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    const snackBarMock = {
        open: jasmine.createSpy('open'),
    };

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['init', 'usernameValue', 'stateSubscribe'], {
            currentQuestion: QUESTION_PLACEHOLDER,
            currentState: GameState.Starting,
        });
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', [
            'sendMessage',
            'joinRoom',
            'getMessages',
            'leaveRoom',
            'getMessage',
            'getState',
            'getClosedConnection',
            'getTime',
            'getScoreUpdate',
            'getUserUpdate',
            'getUsersStat',
            'getHistogramData',
        ]);
        mockWebSocketService.getMessage.and.returnValue(of({} as Message));
        mockWebSocketService.getState.and.returnValue(of({} as GameStatePayload));
        mockWebSocketService.getClosedConnection.and.returnValue(of({} as string));
        mockWebSocketService.getTime.and.returnValue(of({} as number));
        mockWebSocketService.getScoreUpdate.and.returnValue(of({} as Score));
        mockWebSocketService.getUserUpdate.and.returnValue(of({} as UserConnectionUpdate));
        mockWebSocketService.getUsersStat.and.returnValue(of({} as UserStat[]));

        const messages: Message[] = [
            { name: 'test', message: 'test', timestamp: 1 },
            { name: 'test', message: 'test', timestamp: 3 },
            { name: 'test', message: 'test', timestamp: 2 },
        ];
        mockWebSocketService.getMessages.and.returnValue(new Promise<Message[]>((resolve) => resolve(messages)));

        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule],
            providers: [
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: GameService, useValue: mockGameService },
                { provide: MatSnackBar, useValue: snackBarMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.username = 'username';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(mockWebSocketService.getMessage).toHaveBeenCalled();
        expect(mockWebSocketService.getMessages).toHaveBeenCalled();
    });

    it('should focus', () => {
        let emitted = false;
        component.isChatFocused.subscribe((event: boolean) => {
            emitted = event;
        });
        component.onFocus();
        expect(emitted).toBeTrue();
    });

    it('should focusOut', () => {
        let emitted = true;
        component.isChatFocused.subscribe((event: boolean) => {
            emitted = event;
        });
        component.onFocusOut();
        expect(emitted).toBeFalse();
    });

    it('should chatSubmit', () => {
        component.chatInput = 'test';
        component.chatSubmit();
        expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith('test');
        expect(component.chatInput).toEqual('');
    });

    it('should not chatSubmit', () => {
        component.chatInput = '';
        component.chatSubmit();
        expect(mockWebSocketService.sendMessage).not.toHaveBeenCalled();
    });

    it('should buttonDetect', () => {
        component.chatInput = 'test';
        spyOn(component, 'chatSubmit');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(event);
        expect(component.chatSubmit).toHaveBeenCalled();
    });

    it('should not buttonDetect', () => {
        component.chatInput = 'test';
        spyOn(component, 'chatSubmit');
        const event = new KeyboardEvent('keydown', { key: 'Space' });
        component.buttonDetect(event);
        expect(component.chatSubmit).not.toHaveBeenCalled();
    });

    it('should ngOnDestroy', () => {
        spyOn(component['messagesSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(mockWebSocketService.leaveRoom).toHaveBeenCalled();
        expect(component['messagesSubscription'].unsubscribe).toHaveBeenCalled();
    });

    it('should sort messages', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        const sorted = [
            { name: 'test', message: 'test', timestamp: 3 },
            { name: 'test', message: 'test', timestamp: 2 },
            { name: 'test', message: 'test', timestamp: 1 },
        ];
        expect(component.chat).toEqual(sorted);
    }));

    it('should calculate time', () => {
        const minute = 10;
        const hours = 10;
        const t = new Date();
        t.setHours(hours);
        t.setMinutes(minute);
        const time = component.calculateTime(t.getTime());
        expect(time).toEqual('10:10');
    });
});
