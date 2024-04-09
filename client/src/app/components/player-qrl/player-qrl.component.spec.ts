import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerQRLComponent } from './player-qrl.component';

describe('PlayerQRLComponent', () => {
    let component: PlayerQRLComponent;
    let fixture: ComponentFixture<PlayerQRLComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule],
        });
        fixture = TestBed.createComponent(PlayerQRLComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
