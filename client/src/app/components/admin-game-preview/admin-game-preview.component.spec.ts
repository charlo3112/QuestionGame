import { Location } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@app/interfaces/game';
import { routes } from '@app/modules/app-routing.module';
import { AdminGamePreviewComponent } from './admin-game-preview.component';

describe('AdminGamePreviewComponent', () => {
    let component: AdminGamePreviewComponent;
    let fixture: ComponentFixture<AdminGamePreviewComponent>;
    let mockGameDetails: Game;
    let router: Router;
    let location: Location;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatIconModule, AdminGamePreviewComponent, RouterTestingModule, RouterLink, RouterModule.forRoot(routes)],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(AdminGamePreviewComponent);
        component = fixture.componentInstance;
        mockGameDetails = {
            title: 'Test Game',
            id: 'test-game',
            description: 'This is a test game',
            image: '#',
            lastModification: '01-01-2024',
            questions: [],
            duration: 10,
            isVisible: true,
        };
        component.gameDetails = mockGameDetails;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should redirect to edit ', fakeAsync(() => {
        const editButton = fixture.debugElement.query(By.css('.admin-edit')).nativeElement;
        editButton.click();
        tick();
        expect(location.path()).toBe('/admin/game/test-game');
    }));

    it('should emit delete event when export button is clicked', () => {
        spyOn(component.delete, 'emit');
        const deleteButton = fixture.debugElement.query(By.css('.admin-delete')).nativeElement;
        deleteButton.click();
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
        const toggleVisibilityButton = fixture.debugElement.query(By.css('.admin-visibility')).nativeElement;
        toggleVisibilityButton.click();
        expect(component.toggleVisibility.emit).toHaveBeenCalled();
    });
});
