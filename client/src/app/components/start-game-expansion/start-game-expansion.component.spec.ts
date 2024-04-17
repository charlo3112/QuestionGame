import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GAME_PLACEHOLDER } from '@common/interfaces/game';
import { StartGameExpansionComponent } from './start-game-expansion.component';

describe('StartGameExpansionComponent', () => {
    let component: StartGameExpansionComponent;
    let fixture: ComponentFixture<StartGameExpansionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatButtonModule, MatExpansionModule, StartGameExpansionComponent, BrowserAnimationsModule, NoopAnimationsModule],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(StartGameExpansionComponent);
        component = fixture.componentInstance;
        component.gameDetails = GAME_PLACEHOLDER;
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
