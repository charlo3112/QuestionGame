import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminGameDetails } from '@app/classes/game-details';
import { StartGameExpansionComponent } from './startgame-expansion.component';

describe('StartGameExpansionComponent', () => {
    let component: StartGameExpansionComponent;
    let fixture: ComponentFixture<StartGameExpansionComponent>;
    let mockGameDetails: AdminGameDetails;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatButtonModule, MatExpansionModule, StartGameExpansionComponent, BrowserAnimationsModule, NoopAnimationsModule],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(StartGameExpansionComponent);
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

    it('should emit startGame event when onStartGame is called', () => {
        spyOn(component.startGame, 'emit');
        component.onStartGame();
        expect(component.startGame.emit).toHaveBeenCalled();
    });

    it('should emit testGame event when onTestGame is called', () => {
        spyOn(component.testGame, 'emit');
        component.onTestGame();
        expect(component.testGame.emit).toHaveBeenCalled();
    });
});
