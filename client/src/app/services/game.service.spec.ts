import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameState } from '@common/enums/game-state';
import { QuestionType } from '@common/enums/question-type';
import { GAME_PLACEHOLDER } from '@common/interfaces/game';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { of } from 'rxjs';
import { GameService } from './game.service';
import { TimeService } from './time.service';
import { WebSocketService } from './websocket.service';
import SpyObj = jasmine.SpyObj;

const timeConfirmMs = 3000;
const timeQuestionMs = 60000;

class TimeServiceStub {
    get time(): number {
        return 2;
    }
    startTimer(startValue: number, execute: () => void) {
        setTimeout(execute, 0);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopTimer() {}
    setTimeout(execute: () => void, timeMs: number) {
        setTimeout(execute, timeMs);
    }
}

describe('Game', () => {
    let service: GameService;
    const timeService: TimeServiceStub = new TimeServiceStub();
    const mockRouter = {
        navigate: jasmine.createSpy('navigate'),
    };
    let snackBarSpy: SpyObj<MatSnackBar>;
    let webSocketSpy: SpyObj<WebSocketService>;

    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        webSocketSpy = jasmine.createSpyObj('WebSocketService', [
            'leaveRoom',
            'rejoinRoom',
            'getScore',
            'getUsers',
            'nextQuestion',
            'showResults',
            'sendChoice',
            'validateChoice',
            'getTime',
            'getUserUpdate',
            'getUsersStat',
            'getState',
            'getClosedConnection',
            'getScoreUpdate',
        ]);

        webSocketSpy.getState.and.returnValue(of({ state: GameState.Wait }));
        webSocketSpy.getTime.and.returnValue(of(30));
        webSocketSpy.getUserUpdate.and.returnValue(of({ username: 'test', isConnected: true }));
        webSocketSpy.getUsersStat.and.returnValue(of([]));
        webSocketSpy.getClosedConnection.and.returnValue(of('Connection closed'));
        const mockScoreUpdate: Score = { score: 0, bonus: false };
        webSocketSpy.getScoreUpdate.and.returnValue(of(mockScoreUpdate));
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                GameService,
                { provide: Router, useValue: mockRouter },
                { provide: TimeService, useValue: timeService },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: WebSocketService, useValue: webSocketSpy },
            ],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return false when the choice is not selected', () => {
        expect(service.isChoiceSelected(0)).toBeFalsy();
    });

    it('should not return a question when GameState is not AskingQuestion or ShowResults', () => {
        service['state'] = GameState.GameOver;
        expect(service.currentQuestion).toBeUndefined();
    });

    it('should return the state of the game', () => {
        service.reset();
        expect(service.currentState).toEqual(GameState.NotStarted);
    });

    it('should return the current question', () => {
        service['question'] = structuredClone(GAME_PLACEHOLDER).questions[0];
        expect(service.currentQuestion).toEqual(structuredClone(GAME_PLACEHOLDER).questions[0]);
    });

    it('should return the current question when GameState is ShowResults', () => {
        const currentQuestion = structuredClone(GAME_PLACEHOLDER).questions[0];
        service['question'] = currentQuestion;
        service['state'] = GameState.ShowResults;
        expect(service.currentQuestion).toEqual(currentQuestion);
    });

    it('should return undefined when there is no bonus', () => {
        expect(service.message).toBeUndefined();
    });

    it('should return false when the choice is not correct', () => {
        expect(service.isChoiceCorrect(0)).toBeFalsy();
    });

    it('should return true when the choice is correct', () => {
        const correctQuestion: Question = {
            ...GAME_PLACEHOLDER.questions[0],
            choices: GAME_PLACEHOLDER.questions[0].choices.map((choice, index) => ({
                ...choice,
                isCorrect: index === 0,
            })),
        };
        service['question'] = correctQuestion;
        service['state'] = GameState.ShowResults;
        service.selectChoice(0);
        expect(service.isChoiceCorrect(0)).toBeTruthy();
    });

    it('should return false when the state is not show results', () => {
        expect(service.isChoiceIncorrect(0)).toBeFalsy();
    });

    it('should return false when the choice is correct', () => {
        service.selectChoice(0);
        service['state'] = GameState.ShowResults;
        expect(service.isChoiceIncorrect(0)).toBeFalsy();
    });

    it('should return true when the choice is selected and incorrect', () => {
        const questionWithIncorrectChoice: Question = {
            type: QuestionType.QCM,
            text: "Pourquoi le jus de lichi n'est pas bon?",
            points: 69,
            choices: [
                { text: 'Guillaume en boit', isCorrect: true },
                { text: 'Guillaume en a apporté 2 boites', isCorrect: true },
                { text: "C'est du lichi", isCorrect: false },
                { text: 'Guillaume en a bu à 9h du matin', isCorrect: true },
            ],
        };
        service['question'] = questionWithIncorrectChoice;
        service['state'] = GameState.ShowResults;
        service.selectChoice(2);
        expect(service.isChoiceIncorrect(2)).toBeTruthy();
    });

    it('should not allow to select choice when the state is not asking question', () => {
        service['state'] = GameState.ShowResults;
        service.selectChoice(0);
        expect(service['choicesSelected'][0]).toBeFalsy();
    });

    it('should allow to select choice when the state is asking question', () => {
        service['state'] = GameState.AskingQuestion;
        service.selectChoice(0);
        expect(service['choicesSelected'][0]).toBeTruthy();
    });

    it('should not confirm a question when the state is not AskingQuestion', () => {
        service['state'] = GameState.GameOver;
        service.confirmQuestion();
        expect(service.currentState).not.toBe(GameState.ShowResults);
    });

    it('should confirm a question', () => {
        spyOn(timeService, 'setTimeout');
        service.confirmQuestion();
        expect(timeService.setTimeout).toHaveBeenCalled();
    });

    // Fonctionne pas
    it('should advance state after confirming question', fakeAsync(() => {
        // Necessary to avoid going through the game.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'askQuestion');
        service.confirmQuestion();
        tick(timeConfirmMs + 1);
        expect(service['askQuestion']).toHaveBeenCalled();
    }));

    // Fonctionne pas
    it('should advance when question elapsed', fakeAsync(() => {
        spyOn(service, 'confirmQuestion');
        service['askQuestion']();
        service.selectChoice(0);
        service.selectChoice(1);
        tick(timeQuestionMs + 1);
        expect(service.confirmQuestion).toHaveBeenCalled();
    }));

    // Fonctionne pas
    it('should advance when question confirmed', fakeAsync(() => {
        service.selectChoice(0);
        service.selectChoice(1);
        service.confirmQuestion();
        // Necessary to avoid going through the game.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'askQuestion');
        tick(timeConfirmMs + 1);
        expect(service['askQuestion']).toHaveBeenCalled();
    }));

    it('should return the same time as timeService', () => {
        expect(service.time).toEqual(30);
    });

    it('should return 0 at the start of the game', () => {
        expect(service.score).toEqual(0);
    });

    it('should return the max time (20) of the game', () => {
        expect(service.maxTime).toEqual(20);
    });
});
