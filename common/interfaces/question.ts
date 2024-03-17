import { QuestionType } from '../enums/question-type';
import { Choice, ChoiceWithCounter } from './choice';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
}

export interface QuestionWithCounter extends Question {
    choices: ChoiceWithCounter[];
}

export interface QuestionWithModificationDate extends Question {
    lastModification: Date;
    mongoId: string;
}

export const QUESTIONS_PLACEHOLDER: Question[] = [
    {
        type: QuestionType.QCM,
        text: "Pourquoi le jus de lichi n'est pas bon?",
        points: 69,
        choices: [
            { text: 'Guillaume en boit' },
            { text: 'Guillaume en a apporté 2 boites' },
            { text: "C'est du lichi" },
            { text: 'Guillaume en a bu à 9h du matin' },
        ],
    },
    {
        type: QuestionType.QCM,
        text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
        points: 42,
        choices: [
            { text: 'Les temps de compilation sont abominables' },
            { text: "C'est quoi cette question?." },
            { text: 'Le javascript est une erreur.' },
        ],
    },
    {
        type: QuestionType.QCM,
        text: 'Quel est mieux angular ou React?',
        points: 69,
        choices: [{ text: 'Les deux sont horribles' }, { text: 'Angular?' }, { text: 'React' }],
    },
    {
        type: QuestionType.QCM,
        text: "Comment utiliser Git d'une manière optimale?",
        points: 42,
        choices: [
            { text: 'Force push sur master' },
            { text: 'Force push sur master' },
            { text: 'Force push sur master' },
            { text: 'Merge request sur une branche dev' },
        ],
    },
    {
        type: QuestionType.QCM,
        text: 'Est-ce que nous avons fait tous ce que nous avons promis?',
        points: 69,
        choices: [{ text: 'Oui' }, { text: 'Non' }],
    },
];
export const QUESTIONS_PLACEHOLDER_COUNTER: QuestionWithCounter[] = [
    {
        type: QuestionType.QCM,
        text: "Pourquoi le jus de lichi n'est pas bon?",
        points: 69,
        choices: [
            { text: 'Guillaume en boit', counter: 2, isCorrect: true },
            { text: 'Guillaume en a apporté 2 boites', counter: 1, isCorrect: false },
            { text: "C'est du lichi", counter: 0, isCorrect: false },
            { text: 'Guillaume en a bu à 9h du matin', counter: 6, isCorrect: true },
        ],
    },
    {
        type: QuestionType.QCM,
        text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
        points: 42,
        choices: [
            { text: 'Les temps de compilation sont abominables', counter: 2, isCorrect: false },
            { text: 'C.', counter: 4, isCorrect: false },
            { text: 'Le javascript est une erreur.', counter: 5, isCorrect: true },
        ],
    },
];
export const EMPTY_QUESTION: Question = {
    type: QuestionType.QCM,
    text: '',
    points: 0,
    choices: [],
};
