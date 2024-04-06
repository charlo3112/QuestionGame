import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQrlComponent } from './admin-qrl.component';

describe('AdminQrlComponent', () => {
    let component: AdminQrlComponent;
    let fixture: ComponentFixture<AdminQrlComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminQrlComponent],
        });
        fixture = TestBed.createComponent(AdminQrlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
