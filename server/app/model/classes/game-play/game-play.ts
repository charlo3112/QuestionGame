import { GameData } from '@app/model/database/game';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';

export class GamePlay {
    private questionIndex$ = 0;
    private questions$: Question[];
    private title$: string;
    private duration$: number;

    constructor(game: GameData) {
        this.questions$ = game.questions;
        this.title$ = game.title;
        this.duration$ = game.duration;
    }

    get questionIndex(): number {
        return this.questionIndex$;
    }

    get questions(): Question[] {
        return this.questions$;
    }

    get duration(): number {
        return this.duration$;
    }

    get title(): string {
        return this.title$;
    }

    get currentQuestionWithAnswer(): Question {
        return this.questions[this.questionIndex];
    }

    get currentQuestionWithoutAnswer(): Question {
        const data = this.questions[this.questionIndex];
        return data.type === QuestionType.QRL
            ? data
            : {
                  type: data.type,
                  text: data.text,
                  points: data.points,
                  choices: data.choices.map((choice) => {
                      return {
                          text: choice.text,
                          isCorrect: false,
                      };
                  }),
              };
    }

    addIndexCurrentQuestion(): void {
        if (this.questionIndex < this.questions.length - 1) {
            this.questionIndex$++;
        }
    }
}
