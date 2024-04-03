import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SortOption } from '@app/enums/sort-option';
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
    let mockSortOption: SortOption;

    beforeEach(() => {
        gameService = jasmine.createSpyObj('GameService', ['usersStat', 'sortOption']);
        Object.defineProperty(gameService, 'usersStat', {
            get: jasmine.createSpy('usersStat.get').and.callFake(() => mockUsersStat),
        });

        Object.defineProperty(gameService, 'sortOption', {
            get: jasmine.createSpy('sortOption.get').and.callFake(() => mockSortOption),
            set: jasmine.createSpy('sortOption.set').and.callFake((value) => {
                mockSortOption = value;
            }),
        });

        mockUsersStat = [];
        mockSortOption = SortOption.ScoreAscending;

        TestBed.configureTestingModule({
            imports: [LeaderboardComponent, CommonModule, MatIconModule, MatButtonModule, BrowserAnimationsModule, NoopAnimationsModule],
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

    describe('getClassState', () => {
        it('should return correct class for NoInteraction', () => {
            expect(component.getClassState(UserState.NoInteraction)).toEqual('no-interaction');
        });

        it('should return correct class for FirstInteraction', () => {
            expect(component.getClassState(UserState.FirstInteraction)).toEqual('first-interaction');
        });

        it('should return correct class for AnswerConfirmed', () => {
            expect(component.getClassState(UserState.AnswerConfirmed)).toEqual('answer-confirmed');
        });

        it('should return correct class for Disconnect', () => {
            expect(component.getClassState(UserState.Disconnect)).toEqual('disconnect');
        });

        it('should return empty string for undefined state', () => {
            expect(component.getClassState(UserState.FinalResults)).toEqual('');
        });
    });

    describe('onSortOptionChange', () => {
        it('should set sort option for user', () => {
            component.onSortOptionChange('user');
            expect(component.selectedSort).toEqual('user');
        });

        it('should set sort option for score', () => {
            component.onSortOptionChange('score');
            expect(component.selectedSort).toEqual('score');
        });

        it('should set sort option for state', () => {
            component.onSortOptionChange('state');
            expect(component.selectedSort).toEqual('state');
        });
    });

    describe('onSortOrderChange', () => {
        it('should set sort order to asc', () => {
            component.onSortOrderChange('asc');
            expect(component.selectedSortOrder).toEqual('asc');
        });

        it('should set sort order to desc', () => {
            component.onSortOrderChange('desc');
            expect(component.selectedSortOrder).toEqual('desc');
        });
    });

    describe('setOptionSort', () => {
        it('should set game service sort option correctly for user ascending', () => {
            component.setOptionSort('user', 'asc');
            expect(gameService.sortOption).toEqual(SortOption.UsernameAscending);
        });

        it('should set game service sort option correctly for user descending', () => {
            component.setOptionSort('user', 'desc');
            expect(gameService.sortOption).toEqual(SortOption.UsernameDescending);
        });

        it('should set game service sort option correctly for score ascending', () => {
            component.setOptionSort('score', 'asc');
            expect(gameService.sortOption).toEqual(SortOption.ScoreAscending);
        });

        it('should set game service sort option correctly for score descending', () => {
            component.setOptionSort('score', 'desc');
            expect(gameService.sortOption).toEqual(SortOption.ScoreDescending);
        });

        it('should set game service sort option correctly for state ascending', () => {
            component.setOptionSort('state', 'asc');
            expect(gameService.sortOption).toEqual(SortOption.StateAscending);
        });

        it('should set game service sort option correctly for state descending', () => {
            component.setOptionSort('state', 'desc');
            expect(gameService.sortOption).toEqual(SortOption.StateDescending);
        });
    });
});
