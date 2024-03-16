import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game.service';
import { Choice } from '@common/interfaces/choice';
import { AnswersComponent } from './answers.component';

describe('AnswerComponent', () => {
    let component: AnswersComponent;
    let fixture: ComponentFixture<AnswersComponent>;
    const snackBarMock = {
        open: jasmine.createSpy('open'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [GameService, { provide: MatSnackBar, useValue: snackBarMock }],
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
            const choices: Choice[] = [{ text: 'A' }, { text: 'B' }, { text: 'C' }];
            component.choices = choices;
            expect(component.getAnswerClass()).toEqual('answers-3');
        });

        it('should return "answers-0" when answers is empty', () => {
            component.choices = [];
            expect(component.getAnswerClass()).toEqual('answers-0');
        });
    });
});
