import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Choice } from '@app/classes/choice';
import { AnswersComponent } from './answers.component';

describe('AnswerComponent', () => {
    let component: AnswersComponent;
    let fixture: ComponentFixture<AnswersComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
        });
        fixture = TestBed.createComponent(AnswersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getAnswerClass', () => {
        it('should return a string with the length of answers', () => {
            const choices: Choice[] = [new Choice('A', false), new Choice('B', true), new Choice('C', false)];
            component.choices = choices;
            expect(component.getAnswerClass()).toEqual('answers-3');
        });

        it('should return "answers-0" when answers is empty', () => {
            component.choices = [];
            expect(component.getAnswerClass()).toEqual('answers-0');
        });
    });
});
