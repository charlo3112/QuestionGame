import { Location } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { GameService } from '@app/services/game/game.service';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let router: Router;
    let location: Location;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, RouterLink, RouterModule.forRoot(routes)],
            providers: [{ provide: GameService, useValue: jasmine.createSpyObj('GameService', ['init', 'leaveRoom']) }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should link to game', fakeAsync(() => {
        fixture.debugElement.query(By.css('#game')).nativeElement.click();
        tick();
        expect(location.path()).toBe('/join');
    }));

    it('should link to new', fakeAsync(() => {
        fixture.debugElement.query(By.css('#new')).nativeElement.click();
        tick();
        expect(location.path()).toBe('/new');
    }));

    it('should link to admin', fakeAsync(() => {
        fixture.debugElement.query(By.css('#admin')).nativeElement.click();
        tick();
        expect(location.path()).toBe('/admin');
    }));
});
