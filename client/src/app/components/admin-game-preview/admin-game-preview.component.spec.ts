import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { AdminGameDetails } from '@app/classes/game-details';
import { AdminGamePreviewComponent } from './admin-game-preview.component';

describe('AdminGamePreviewComponent', () => {
    let component: AdminGamePreviewComponent;
    let fixture: ComponentFixture<AdminGamePreviewComponent>;
    let mockGameDetails: AdminGameDetails;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatIconModule, AdminGamePreviewComponent],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(AdminGamePreviewComponent);
        component = fixture.componentInstance;
        mockGameDetails = {
            name: 'Test Game',
            id: 'test-game',
            description: 'This is a test game',
            image: '#',
            lastModified: '01-01-2024',
            isVisible: true,
        };
        component.gameDetails = mockGameDetails;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit edit event when export button is clicked', () => {
        spyOn(component.edit, 'emit');
        const exportButton = fixture.debugElement.query(By.css('.admin-edit')).nativeElement;
        exportButton.click();
        expect(component.edit.emit).toHaveBeenCalled();
    });

    it('should emit delete event when export button is clicked', () => {
        spyOn(component.delete, 'emit');
        const exportButton = fixture.debugElement.query(By.css('.admin-delete')).nativeElement;
        exportButton.click();
        expect(component.delete.emit).toHaveBeenCalled();
    });

    it('should emit export event when export button is clicked', () => {
        spyOn(component.export, 'emit');
        const exportButton = fixture.debugElement.query(By.css('.admin-export')).nativeElement;
        exportButton.click();
        expect(component.export.emit).toHaveBeenCalled();
    });

    it('should emit toggleVisibility event when export button is clicked', () => {
        spyOn(component.toggleVisibility, 'emit');
        const exportButton = fixture.debugElement.query(By.css('.admin-visibility')).nativeElement;
        exportButton.click();
        expect(component.toggleVisibility.emit).toHaveBeenCalled();
    });
});
