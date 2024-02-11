import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuestionComponent } from '@app/components/question/question.component';
import { QuestionType } from '@app/enums/question-type';
import { TimeService } from '@app/services/time.service';
import SpyObj = jasmine.SpyObj;
import { Choice } from '@app/classes/choice';
import { Router } from '@angular/router';
import { routes } from '@app/modules/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

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
    let router: Router;
    let location: Location;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), BrowserAnimationsModule],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.question = mockQuestion;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate on abandon', fakeAsync(() => {
        fixture.debugElement.query(By.css('#abandon-button')).nativeElement.click();
        tick();
        expect(location.path()).toBe('/home');
    }));
});
