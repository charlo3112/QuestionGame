import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game/game.service';
import { UserState } from '@common/enums/user-state';
import { UserStat } from '@common/interfaces/user-stat';
import { LeaderboardComponent } from './leaderboard.component';

describe('LeaderboardComponent', () => {
    let component: LeaderboardComponent;
    let fixture: ComponentFixture<LeaderboardComponent>;
    const snackBarMock = {
        open: jasmine.createSpy('open'),
    };

    let gameService: jasmine.SpyObj<GameService>;
    let mockUsersStat: UserStat[];

    beforeEach(() => {
        gameService = jasmine.createSpyObj('GameService', ['usersStat']);
        Object.defineProperty(gameService, 'usersStat', {
            get: () => mockUsersStat,
        });

        mockUsersStat = [];

        TestBed.configureTestingModule({
            imports: [LeaderboardComponent, CommonModule],
            providers: [
                { provide: MatSnackBar, useValue: snackBarMock },
                { provide: GameService, useValue: gameService },
            ],
        });
        fixture = TestBed.createComponent(LeaderboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct class state', () => {
        expect(component.getClassState(UserState.NoInteraction)).toEqual('no-interaction');
        expect(component.getClassState(UserState.FirstInteraction)).toEqual('first-interaction');
        expect(component.getClassState(UserState.AnswerConfirmed)).toEqual('answer-confirmed');
        expect(component.getClassState(UserState.Disconnect)).toEqual('disconnect');
        expect(component.getClassState(UserState.FinalResults)).toEqual('');
    });
});
