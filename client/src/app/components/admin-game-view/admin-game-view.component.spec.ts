import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameService } from '@app/services/game.service';
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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
