import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication/communication.service';
import { History } from '@common/interfaces/history';
import { Result } from '@common/interfaces/result';
import { of } from 'rxjs';
import { HistoryItemsComponent } from './history-items.component';
import SpyObj = jasmine.SpyObj;

describe('HistoryItemsComponent', () => {
    let component: HistoryItemsComponent;
    let fixture: ComponentFixture<HistoryItemsComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['deleteHistories', 'getHistories']);
        const mockHistoryResponse: Result<History[]> = {
            ok: true,
            value: [],
        };

        communicationServiceSpy.getHistories.and.returnValue(of(mockHistoryResponse));

        TestBed.configureTestingModule({
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
            imports: [HistoryItemsComponent, BrowserAnimationsModule, NoopAnimationsModule],
        });
        fixture = TestBed.createComponent(HistoryItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
