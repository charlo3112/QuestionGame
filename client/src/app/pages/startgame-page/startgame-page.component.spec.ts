import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { routes } from '@app/modules/app-routing.module';
import { StartGamePageComponent } from './startgame-page.component';

describe('StartGamePageComponent', () => {
    let component: StartGamePageComponent;
    let fixture: ComponentFixture<StartGamePageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                StartGameExpansionComponent,
                StartGamePageComponent,
                RouterTestingModule,
                RouterLink,
                MatExpansionModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                RouterModule.forRoot(routes),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(StartGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a title', () => {
        expect(component.title).toBe('Liste de jeux');
    });

    it('should have a list of games', () => {
        expect(component.games.length).toBeGreaterThan(0);
    });

    it('should start a game', () => {
        const gameId = 'id';
        component.startGame(gameId);
        // Add your assertions here to test the behavior after starting a game
    });

    it('should test a game', () => {
        const gameId = 'id';
        component.testGame(gameId);
        // Add your assertions here to test the behavior after testing a game
    });
});
