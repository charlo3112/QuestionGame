import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { GameService } from '@app/services/game/game.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { TextAnswerComponent } from './text-answer.component';

describe('TextAnswerComponent', () => {
    let component: TextAnswerComponent;
    let fixture: ComponentFixture<TextAnswerComponent>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;
    let gameSubscriptionServiceSpy: jasmine.SpyObj<GameSubscriptionService>;
    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            imports: [TextAnswerComponent],
            providers: [
                GameService,
                { provide: MatSnackBar, useValue: snackBarSpy },
                HttpClient,
                HttpHandler,
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
                { provide: GameSubscriptionService, useValue: gameSubscriptionServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TextAnswerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
