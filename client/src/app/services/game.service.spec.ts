import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameService } from './game.service';
import { questions } from '@app/interfaces/question';
import { GameState } from '@app/enums/game-state';
import { Choice } from '@app/classes/choice';
import { Router } from '@angular/router';
import { TimeService } from './time.service';

const timeConfirmMs = 3000;
const timeQuestionMs = 60000;

class TimeServiceStub {
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

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: TimeService, useValue: timeService },
            ],
        });
        service = TestBed.inject(GameService);
        service.startGame(
            questions.map((question) => ({ ...question, choices: question.choices.map((choice) => new Choice(choice.text, choice.isCorrect)) })),
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not return a question when GameState is not AskingQuestion or ShowResults', () => {
        service['state'] = GameState.Gameover;
        expect(service.currentQuestion).toBeUndefined();
    });

    it('should return the asking question state', () => {
        expect(service.currentState).toEqual(GameState.AskingQuestion);
    });

    it('should return the current question', () => {
        expect(service.currentQuestion).toEqual(questions[0]);
    });

    it('should return the current question when GameState is ShowResults', () => {
        service['state'] = GameState.ShowResults;
        expect(service.currentQuestion).toEqual(questions[0]);
    });

    it('should return undefined when there is no bonus', () => {
        expect(service.message).toBeUndefined();
    });

    it('should return a bonus message when in ShowResults', () => {
        service['bonus'] = true;
        service['state'] = GameState.ShowResults;
        service['questions'][0].choices[0].isSelected = true;
        service['questions'][0].choices[1].isSelected = true;
        expect(service.message).toEqual('Vous avez un bonus!');
    });

    it('should return false when the state is not show results', () => {
        service['state'] = GameState.ShowResults;
        expect(service.isChoiceCorrect(0)).toBeFalsy();
    });

    it('should return false when the choice is not correct', () => {
        expect(service.isChoiceCorrect(0)).toBeFalsy();
    });

    it('should return true when the choice is correct', () => {
        service.selectChoice(0);
        service['state'] = GameState.ShowResults;
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

    it('should return true when the choice is incorrect', () => {
        service['state'] = GameState.ShowResults;
        service['questions'][0].choices[0].isSelected = false;
        expect(service.isChoiceIncorrect(0)).toBeTruthy();
    });

    it('should not allow to select choice when the state is not asking question', () => {
        service['state'] = GameState.ShowResults;
        service['questions'][0].choices[0].isSelected = false;
        service.selectChoice(0);
        expect(service['questions'][0].choices[0].isSelected).toBeFalsy();
    });

    it('should allow to select choice when the state is asking question', () => {
        service.selectChoice(0);
        expect(service['questions'][0].choices[0].isSelected).toBeTruthy();
    });

    it('should not confirm a question when the state is not AskingQuestion', () => {
        service['state'] = GameState.Gameover;
        service.confirmQuestion();
        expect(service.currentState).not.toBe(GameState.ShowResults);
    });

    it('should confirm a question', () => {
        spyOn(timeService, 'setTimeout');
        service.confirmQuestion();
        expect(timeService.setTimeout).toHaveBeenCalled();
    });

    it('should advance state after confirming question', fakeAsync(() => {
        // Necessary to avoid going through the game.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'askQuestion');
        service.confirmQuestion();
        tick(timeConfirmMs + 1);
        expect(service['askQuestion']).toHaveBeenCalled();
    }));

    it('should navigate when GameOver', fakeAsync(() => {
        service['i'] = questions.length - 1;
        service.confirmQuestion();
        service['state'] = GameState.Gameover;
        tick(timeConfirmMs + 1);
        expect(mockRouter.navigate).toHaveBeenCalled();
    }));

    it('should advance when question elapsed', fakeAsync(() => {
        service['askQuestion']();
        service.selectChoice(0);
        service.selectChoice(1);
        spyOn(service, 'confirmQuestion');
        tick(timeQuestionMs + 1);
        expect(service.confirmQuestion).toHaveBeenCalled();
    }));

    it('should toggle the bonus', () => {
        service.toggleBonus();
        expect(service['bonus']).toBeTruthy();
    });
});
