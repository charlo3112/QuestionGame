import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { EraseHistoryDialogComponent } from './erase-history-dialog.component';

describe('EraseHistoryDialogComponent', () => {
    let component: EraseHistoryDialogComponent;
    let fixture: ComponentFixture<EraseHistoryDialogComponent>;
    let mockDialogRef: MatDialogRef<EraseHistoryDialogComponent>;

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            imports: [EraseHistoryDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: mockDialogRef }],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EraseHistoryDialogComponent],
        });
        fixture = TestBed.createComponent(EraseHistoryDialogComponent);
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
