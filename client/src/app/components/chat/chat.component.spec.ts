import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameService } from '@app/services/game.service';
import { WebSocketService } from '@app/services/websocket.service';
import { Message } from '@common/interfaces/message';
import { of } from 'rxjs';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    const snackBarMock = {
        open: jasmine.createSpy('open'),
    };

    beforeEach(async () => {
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['sendMessage', 'joinRoom', 'getMessages', 'leaveRoom', 'getMessage']);
        mockWebSocketService.getMessage.and.returnValue(of({} as Message));

        const messages: Message[] = [
            { name: 'test', message: 'test', timestamp: 1 },
            { name: 'test', message: 'test', timestamp: 3 },
            { name: 'test', message: 'test', timestamp: 2 },
        ];
        mockWebSocketService.getMessages.and.returnValue(new Promise<Message[]>((resolve) => resolve(messages)));

        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule],
            providers: [{ provide: WebSocketService, useValue: mockWebSocketService }, GameService, { provide: MatSnackBar, useValue: snackBarMock }],
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
        component.ngOnInit();
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
