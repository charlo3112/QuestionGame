import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GAME_PLACEHOLDER, Game } from '@app/interfaces/game';
import { StartGameExpansionComponent } from './startgame-expansion.component';

describe('StartGameExpansionComponent', () => {
    let component: StartGameExpansionComponent;
    let fixture: ComponentFixture<StartGameExpansionComponent>;
    let mockGameDetails: Game;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatButtonModule, MatExpansionModule, StartGameExpansionComponent, BrowserAnimationsModule, NoopAnimationsModule],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(StartGameExpansionComponent);
        component = fixture.componentInstance;
        mockGameDetails = GAME_PLACEHOLDER;
        component.gameDetails = mockGameDetails;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit startGame event when onStartGame is called', () => {
        mockGameDetails.visibility = true;
        spyOn(component.startGame, 'emit');
        component.onStartGame(mockGameDetails);
        expect(component.startGame.emit).toHaveBeenCalled();
    });

    it('should emit testGame event when onTestGame is called', () => {
        mockGameDetails.visibility = true;
        spyOn(component.testGame, 'emit');
        component.onTestGame(mockGameDetails);
        expect(component.testGame.emit).toHaveBeenCalled();
    });

    it('should emit refreshGames event when onRefreshGames is called', () => {
        spyOn(component.refreshGames, 'emit');

        // Call onRefreshGames
        component.onRefreshGames();

        // Check if refreshGames event is emitted
        expect(component.refreshGames.emit).toHaveBeenCalled();
    });

    it('should not emit startGame event when onStartGame is called with non-visible game', () => {
        spyOn(component.startGame, 'emit');

        // Set game visibility to false
        mockGameDetails.visibility = false;

        // Call onStartGame with mock game details
        component.onStartGame(mockGameDetails);

        // Check if startGame event is not emitted
        expect(component.startGame.emit).not.toHaveBeenCalled();
    });

    it('should not emit testGame event when onTestGame is called with non-visible game', () => {
        spyOn(component.testGame, 'emit');

        // Set game visibility to false
        mockGameDetails.visibility = false;

        // Call onTestGame with mock game details
        component.onTestGame(mockGameDetails);

        // Check if testGame event is not emitted
        expect(component.testGame.emit).not.toHaveBeenCalled();
    });
});
