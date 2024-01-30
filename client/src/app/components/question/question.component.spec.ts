import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionComponent } from '@app/components/question/question.component';
import { QUESTION_PLACEHOLDER } from '@app/interfaces/question';

describe('QuestionComponent', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.question = QUESTION_PLACEHOLDER;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
