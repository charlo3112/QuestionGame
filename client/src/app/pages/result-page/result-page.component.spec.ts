import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameService } from '@app/services/game/game.service';
import { ResultPageComponent } from './result-page.component';

describe('ResultPageComponent', () => {
    let component: ResultPageComponent;
    let fixture: ComponentFixture<ResultPageComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['selectChoice'], {});
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, BrowserAnimationsModule, NoopAnimationsModule],
            providers: [{ provide: GameService, useValue: mockGameService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
