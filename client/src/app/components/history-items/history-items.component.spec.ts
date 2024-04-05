import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { History } from '@common/interfaces/history';
import { Result } from '@common/interfaces/result';
import { of } from 'rxjs';
import { HistoryItemsComponent } from './history-items.component';
import SpyObj = jasmine.SpyObj;

describe('HistoryItemsComponent', () => {
    let component: HistoryItemsComponent;
    let fixture: ComponentFixture<HistoryItemsComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let historyItems: History[];
    let mockMatDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['deleteHistories', 'getHistories']);
        const mockHistoryResponse: Result<History[]> = {
            ok: true,
            value: [],
        };

        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        communicationServiceSpy.getHistories.and.returnValue(of(mockHistoryResponse));

        TestBed.configureTestingModule({
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog, useValue: mockMatDialog },
            ],
            imports: [HistoryItemsComponent, BrowserAnimationsModule, NoopAnimationsModule],
        });
        fixture = TestBed.createComponent(HistoryItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        historyItems = [
            { name: 'Item 1', date: new Date('2024-03-20'), numberPlayers: 5, bestScore: 100 },
            { name: 'Item 2', date: new Date('2022-03-15'), numberPlayers: 8, bestScore: 40 },
            { name: 'Item 3', date: new Date('2021-03-25'), numberPlayers: 3, bestScore: 620 },
        ];
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call getHistory on ngOnInit', () => {
        spyOn(component, 'getHistory');
        component.ngOnInit();
        expect(component.getHistory).toHaveBeenCalled();
    });

    it('should get historyItems from getHistories', () => {
        communicationServiceSpy.getHistories.and.returnValue(of({ ok: true, value: historyItems }));
        component.getHistory();
        expect(component.historyItems).toEqual(historyItems);
    });

    it('should show an error message if getHistories fails', () => {
        communicationServiceSpy.getHistories.and.returnValue(of({ ok: false, error: 'Erreur lors de la récupération' }));
        spyOn(component, 'openSnackBar');
        component.getHistory();
        expect(component.openSnackBar).toHaveBeenCalledWith("Erreur lors de la récupération de l'historique");
    });

    it('should clear historyItems if deleteHistories is successful', () => {
        communicationServiceSpy.deleteHistories.and.returnValue(of({ ok: true, value: 'succes' }));
        component.historyItems = historyItems;
        component.emptyHistory();
        expect(component.historyItems.length).toBe(0);
    });

    it('should show an error message if deleteHistories fails', () => {
        communicationServiceSpy.deleteHistories.and.returnValue(of({ ok: false, error: 'Erreur lors de la suppression' }));
        spyOn(component, 'openSnackBar');
        component.emptyHistory();
        expect(component.openSnackBar).toHaveBeenCalledWith("Erreur lors de la suppression de l'historique");
    });

    it('should open snackbar when openSnackBar is called', () => {
        spyOn(component['snackBar'], 'open');
        component.openSnackBar('message');
        expect(component['snackBar'].open).toHaveBeenCalledWith('message', undefined, { duration: SNACKBAR_DURATION });
    });

    it('onSortOptionChange should call sortItems and assign recent if parameter is name', () => {
        spyOn(component, 'sortItems');
        component.onSortOptionChange('creationDate');
        expect(component.sortItems).toHaveBeenCalled();
        expect(component.selectedSortOrder).toEqual('recent');
    });

    it('onSortOptionChange should call sortItems and assign recent if parameter is creationDate', () => {
        spyOn(component, 'sortItems');
        component.onSortOptionChange('name');
        expect(component.sortItems).toHaveBeenCalled();
        expect(component.selectedSortOrder).toEqual('az');
    });

    it('onSortOrderChange should call sortItems', () => {
        spyOn(component, 'sortItems');
        component.onSortOrderChange('az');
        expect(component.sortItems).toHaveBeenCalled();
    });

    it('should sort items by name in from A to Z', () => {
        const sortedItems = historyItems.slice().sort((a, b) => a.name.localeCompare(b.name));
        component.historyItems = historyItems;
        component.sortItems('name', 'az');
        expect(component.historyItems).toEqual(sortedItems);
    });

    it('should sort items by name in from Z to A', () => {
        const sortedItems = historyItems.slice().sort((a, b) => b.name.localeCompare(a.name));
        component.historyItems = historyItems;
        component.sortItems('name', 'za');
        expect(component.historyItems).toEqual(sortedItems);
    });

    it('should sort items by date in from oldest to newest', () => {
        const sortedItems = historyItems.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
        component.historyItems = historyItems;
        component.sortItems('creationDate', 'old');
        expect(component.historyItems).toEqual(sortedItems);
    });

    it('should sort items by date in from newest to oldest', () => {
        const sortedItems = historyItems.slice().sort((a, b) => b.date.getTime() - a.date.getTime());
        component.historyItems = historyItems;
        component.sortItems('creationDate', 'recent');
        expect(component.historyItems).toEqual(sortedItems);
    });

    it('should call emptyHistory openEraseDialog is called with true result', () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        mockMatDialog.open.and.returnValue(dialogRefSpy);

        spyOn(component, 'emptyHistory');

        component.openEraseDialog();

        expect(component.emptyHistory).toHaveBeenCalled();
    });
});
