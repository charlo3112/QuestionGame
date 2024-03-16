import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
        });
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
