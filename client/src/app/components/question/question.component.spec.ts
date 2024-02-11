import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionComponent } from '@app/components/question/question.component';
import { QuestionType } from '@app/enums/question-type';
import { TimeService } from '@app/services/time.service';
import SpyObj = jasmine.SpyObj;
import { Choice } from '@app/classes/choice';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const mockQuestion = {
    type: QuestionType.Qcm,
    text: 'Question test',
    points: 8,
    choices: [new Choice('A', true), new Choice('B', false), new Choice('C', false)],
};

describe('Question', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let timeServiceSpy: SpyObj<TimeService>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, RouterLink, RouterModule.forRoot(routes), BrowserAnimationsModule],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.question = mockQuestion;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('buttonDetect with 1 should select first element', () => {
        const expectedKey = '1';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.question.choices[0].isSelected).toEqual(true);
    });
});
