import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { Choice } from '@app/interfaces/choice';
=======

>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
import { AnswersComponent } from './answers.component';

describe('AnswerComponent', () => {
    let component: AnswersComponent;
    let fixture: ComponentFixture<AnswersComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
<<<<<<< HEAD
            imports: [],
=======
            declarations: [AnswersComponent],
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
        });
        fixture = TestBed.createComponent(AnswersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
<<<<<<< HEAD

    describe('getAnswerClass', () => {
        it('should return a string with the length of answers', () => {
            const choices: Choice[] = [{ text: 'A' }, { text: 'B' }, { text: 'C' }];
            component.choices = choices;
            expect(component.getAnswerClass()).toEqual('answers-3');
        });

        it('should return "answers-0" when answers is empty', () => {
            component.choices = [];
            expect(component.getAnswerClass()).toEqual('answers-0');
        });
    });
=======
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
});
