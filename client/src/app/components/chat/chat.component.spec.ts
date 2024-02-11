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
});
