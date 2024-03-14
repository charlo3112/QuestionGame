import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGameViewComponent } from './admin-game-view.component';

describe('AdminGameViewComponentComponent', () => {
    let component: AdminGameViewComponent;
    let fixture: ComponentFixture<AdminGameViewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminGameViewComponent],
        });
        fixture = TestBed.createComponent(AdminGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
