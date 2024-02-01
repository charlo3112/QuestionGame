import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
<<<<<<< HEAD
import { Choice } from '@app/interfaces/choice';
=======

>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
=======
>>>>>>> 85e3ff3 (new tests created pass)
import { AnswersComponent } from './answers.component';

describe('AnswerComponent', () => {
    let component: AnswersComponent;
    let fixture: ComponentFixture<AnswersComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
<<<<<<< HEAD
<<<<<<< HEAD
            imports: [],
=======
            declarations: [AnswersComponent],
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
=======
            imports: [],
>>>>>>> 85e3ff3 (new tests created pass)
        });
        fixture = TestBed.createComponent(AnswersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
<<<<<<< HEAD
<<<<<<< HEAD

    describe('getAnswerClass', () => {
        it('should return a string with the length of answers', () => {
            const choices: Choice[] = [{ text: 'A' }, { text: 'B' }, { text: 'C' }];
            component.choices = choices;
=======

    describe('getAnswerClass', () => {
        it('should return a string with the length of answers', () => {
            component.answers = ['A', 'B', 'C'];
>>>>>>> f5f93a2 (answers tests)
            expect(component.getAnswerClass()).toEqual('answers-3');
        });

        it('should return "answers-0" when answers is empty', () => {
<<<<<<< HEAD
            component.choices = [];
            expect(component.getAnswerClass()).toEqual('answers-0');
        });
    });
=======
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
=======
            component.answers = [];
            expect(component.getAnswerClass()).toEqual('answers-0');
        });
    });
>>>>>>> f5f93a2 (answers tests)
});
