import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameService } from '@app/services/game.service';
import { QUESTIONS_PLACEHOLDER_COUNTER, QUESTION_PLACEHOLDER } from '@common/interfaces/question';
import { AdminGameViewComponent } from './admin-game-view.component';

describe('AdminGameViewComponent', () => {
    let component: AdminGameViewComponent;
    let fixture: ComponentFixture<AdminGameViewComponent>;
    const snackBarMock = {
        open: jasmine.createSpy('open'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminGameViewComponent, BrowserAnimationsModule, NoopAnimationsModule],
            providers: [GameService, { provide: MatSnackBar, useValue: snackBarMock }],
        });
        fixture = TestBed.createComponent(AdminGameViewComponent);
        component = fixture.componentInstance;
        component.questionForHistogram = QUESTIONS_PLACEHOLDER_COUNTER;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnChanges should update questionForHistogram with new question', () => {
        component.question = QUESTION_PLACEHOLDER;
        component.ngOnChanges({
            question: new SimpleChange(null, component.question, true),
        });
        expect(component.questionForHistogram[0]).toEqual(QUESTION_PLACEHOLDER);
    });
});
