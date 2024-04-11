import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameService } from '@app/services/game/game.service';
import { SortOption } from '@common/enums/sort-option';
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
        mockSortOption = SortOption.SCORE_ASCENDING;

        TestBed.configureTestingModule({
            imports: [
                LeaderboardComponent,
                CommonModule,
                MatIconModule,
                MatButtonModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
                MatTableModule,
            ],
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

    describe('getTextState', () => {
        it('should return correct class for NoInteraction', () => {
            expect(component.getTextState(UserState.NoInteraction)).toEqual('Aucune interaction');
        });

        it('should return correct class for FirstInteraction', () => {
            expect(component.getTextState(UserState.FirstInteraction)).toEqual('Réponse choisie');
        });

        it('should return correct class for AnswerConfirmed', () => {
            expect(component.getTextState(UserState.AnswerConfirmed)).toEqual('Réponse confirmée');
        });

        it('should return correct class for FinalResults', () => {
            expect(component.getTextState(UserState.FinalResults)).toEqual('Résultats finaux');
        });

        it('should return correct class for Disconnect', () => {
            expect(component.getTextState(UserState.Disconnect)).toEqual('Déconnecté');
        });
    });

    describe('setOptionSort', () => {
        it('should set game service sort option correctly for user ascending', () => {
            component.setOptionSort({ active: 'username', direction: 'asc' });
            expect(gameService.sortOption).toEqual(SortOption.USERNAME_ASCENDING);
        });

        it('should set game service sort option correctly for user descending', () => {
            component.setOptionSort({ active: 'username', direction: 'desc' });
            expect(gameService.sortOption).toEqual(SortOption.USERNAME_DESCENDING);
        });

        it('should set game service sort option correctly for score ascending', () => {
            component.setOptionSort({ active: 'score', direction: 'asc' });
            expect(gameService.sortOption).toEqual(SortOption.SCORE_ASCENDING);
        });

        it('should set game service sort option correctly for score descending', () => {
            component.setOptionSort({ active: 'score', direction: 'desc' });
            expect(gameService.sortOption).toEqual(SortOption.SCORE_DESCENDING);
        });

        it('should set game service sort option correctly for state ascending', () => {
            component.setOptionSort({ active: 'state', direction: 'asc' });
            expect(gameService.sortOption).toEqual(SortOption.STATE_ASCENDING);
        });

        it('should set game service sort option correctly for state descending', () => {
            component.setOptionSort({ active: 'state', direction: 'desc' });
            expect(gameService.sortOption).toEqual(SortOption.STATE_DESCENDING);
        });

        it('should not set game service sort option if sort is not active', () => {
            component.setOptionSort({ active: '', direction: 'asc' });
            expect(gameService.sortOption).toEqual(SortOption.SCORE_ASCENDING);
        });
    });
});
