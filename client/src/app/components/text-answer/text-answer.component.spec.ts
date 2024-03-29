import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game/game.service';
import { TextAnswerComponent } from './text-answer.component';

describe('TextAnswerComponent', () => {
    let component: TextAnswerComponent;
    let fixture: ComponentFixture<TextAnswerComponent>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            imports: [TextAnswerComponent],
            providers: [GameService, { provide: MatSnackBar, useValue: snackBarSpy }],
        });
        fixture = TestBed.createComponent(TextAnswerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
