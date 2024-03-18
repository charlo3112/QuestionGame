import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { AbandonDialogComponent } from './abandon-dialog.component';

describe('AbandonDialogComponent', () => {
    let component: AbandonDialogComponent;
    let fixture: ComponentFixture<AbandonDialogComponent>;
    let mockDialogRef: MatDialogRef<AbandonDialogComponent>;

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            imports: [AbandonDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: mockDialogRef }],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AbandonDialogComponent],
        });
        fixture = TestBed.createComponent(AbandonDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog without value on no click', () => {
        component.onNoClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close dialog with true value on yes click', () => {
        component.onYesClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
});
