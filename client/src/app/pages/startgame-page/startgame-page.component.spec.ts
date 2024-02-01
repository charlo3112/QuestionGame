import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { By } from '@angular/platform-browser';
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
        // Add your assertions here to test the behavior after starting a game
        // Need to add logic for test
        const gameId = 'id';
        component.startGame(gameId);
        component.games = [
            {
                name: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModified: '01-01-2024',
                isVisible: true,
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'startGame');
        const startButton = fixture.debugElement.query(By.directive(StartGameExpansionComponent));
        startButton.componentInstance.startGame.emit();
        expect(component.startGame).toHaveBeenCalled();
    });

    it('should test a game', () => {
        const gameId = 'id';
        component.startGame(gameId);
        component.games = [
            {
                name: 'Test Game',
                id: 'test-game',
                description: 'This is a test game',
                image: '#',
                lastModified: '01-01-2024',
                isVisible: true,
            },
        ];
        fixture.detectChanges();
        spyOn(component, 'testGame');
        const testButton = fixture.debugElement.query(By.directive(StartGameExpansionComponent));
        testButton.componentInstance.testGame.emit();
        expect(component.testGame).toHaveBeenCalled();
    });
});
