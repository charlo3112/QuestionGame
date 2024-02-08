import { Injectable } from '@angular/core';
import { Question, QuestionType } from '@app/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private questions: Question[] = [
        {
            type: QuestionType.Qcm,
            text: "Pourquoi le jus de lichi n'est pas bon?",
            points: 8,
            choices: [
                { text: 'Guillaume en boit', isCorrect: true },
                { text: 'Guillaume a apporter 2 boites', isCorrect: true },
                { text: "C'est du lichi" },
                { text: 'Guillaume en a bu a 9h du matin' },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
            points: 8,
            choices: [
                { text: 'Les temps de compilation sont abominables', isCorrect: false },
                { text: "C'est quoi cette question?", isCorrect: true },
                { text: 'Le javascript est une erreur.', isCorrect: true },
            ],
        },
    ];

    private i: number = 0;

    setQuestions(newQuestions: Question[]) {
        this.questions = newQuestions;
    }

    getCurrent(): Question | undefined {
        if (this.i > this.questions.length) {
            return undefined;
        }
        return this.questions[this.i];
    }

    next() {
        ++this.i;
    }
}
