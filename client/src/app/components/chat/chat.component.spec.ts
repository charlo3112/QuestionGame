import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from '@app/components/chat/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [BrowserAnimationsModule] }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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
        expect(component.chat).toEqual(['test']);
        expect(component.chatInput).toEqual('');
    });

    it('should not chatSubmit', () => {
        component.chatInput = '';
        component.chatSubmit();
        expect(component.chat).toEqual([]);
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
});
