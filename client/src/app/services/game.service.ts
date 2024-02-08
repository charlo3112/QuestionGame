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
                { text: 'Guillaume en a apporté 2 boites', isCorrect: true },
                { text: "C'est du lichi" },
                { text: 'Guillaume en a bu à 9h du matin' },
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
        {
            type: QuestionType.Qcm,
            text: 'Quel est mieux angular ou React?',
            points: 8,
            choices: [
                { text: 'Les deux sont horribles', isCorrect: false },
                { text: 'Angular?', isCorrect: true },
                { text: 'React', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: "Comment utiliser Git d'une manière optimale?",
            points: 8,
            choices: [
                { text: 'Force push sur master', isCorrect: true },
                { text: 'Force push sur master', isCorrect: true },
                { text: 'Force push sur master', isCorrect: true },
                { text: 'Merge request sur une branche dev', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Est-ce que nous avons fait tous ce que nous avons promis?',
            points: 8,
            choices: [
                { text: 'Oui', isCorrect: false },
                { text: 'Non', isCorrect: true },
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
