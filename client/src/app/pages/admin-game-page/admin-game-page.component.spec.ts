import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGamePageComponent } from './admin-game-page.component';

describe('AdminGamePageComponent', () => {
    let component: AdminGamePageComponent;
    let fixture: ComponentFixture<AdminGamePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminGamePageComponent],
        });
        fixture = TestBed.createComponent(AdminGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
