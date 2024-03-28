import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryPageComponent } from './history-page.component';

describe('HistoryPageComponent', () => {
    let component: HistoryPageComponent;
    let fixture: ComponentFixture<HistoryPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HistoryPageComponent],
        });
        fixture = TestBed.createComponent(HistoryPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
