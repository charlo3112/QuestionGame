import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { WebSocketService } from '@app/services/websocket.service';
import { Message } from '@common/message.interface';
import { of } from 'rxjs';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;

    beforeEach(async () => {
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['sendMessage', 'joinRoom', 'getMessages', 'leaveRoom', 'getMessage']);
        mockWebSocketService.getMessage.and.returnValue(of({} as Message));

        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule],
            providers: [{ provide: WebSocketService, useValue: mockWebSocketService }],
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
});
