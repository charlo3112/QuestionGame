import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { HistoryItemsComponent } from './history-items.component';
import SpyObj = jasmine.SpyObj;

describe('HistoryItemsComponent', () => {
    let component: HistoryItemsComponent;
    let fixture: ComponentFixture<HistoryItemsComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['deleteHistories', 'getHistories']);
        TestBed.configureTestingModule({
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
            imports: [HistoryItemsComponent],
        });
        fixture = TestBed.createComponent(HistoryItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
