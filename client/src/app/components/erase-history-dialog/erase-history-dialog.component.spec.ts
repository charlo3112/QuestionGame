import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EraseHistoryDialogComponent } from './erase-history-dialog.component';

describe('EraseHistoryDialogComponent', () => {
    let component: EraseHistoryDialogComponent;
    let fixture: ComponentFixture<EraseHistoryDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EraseHistoryDialogComponent],
        });
        fixture = TestBed.createComponent(EraseHistoryDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
