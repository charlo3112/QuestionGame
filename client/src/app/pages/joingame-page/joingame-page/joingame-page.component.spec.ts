import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinGamePageComponent } from './joingame-page.component';

describe('JoinGamePageComponent', () => {
    let component: JoinGamePageComponent;
    let fixture: ComponentFixture<JoinGamePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JoinGamePageComponent],
        });
        fixture = TestBed.createComponent(JoinGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
