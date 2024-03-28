import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextAnswerComponent } from './text-answer.component';

describe('TextAnswerComponent', () => {
    let component: TextAnswerComponent;
    let fixture: ComponentFixture<TextAnswerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TextAnswerComponent],
        });
        fixture = TestBed.createComponent(TextAnswerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
