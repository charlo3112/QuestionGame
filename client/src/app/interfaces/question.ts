import { Choice } from '@app/classes/choice';
import { QuestionType } from '@common/constants';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
}

export interface QuestionWithModificationDate extends Question {
    lastModification: Date;
}

export const questions: Question[] = [
    {
        type: QuestionType.QCM,
        text: "Pourquoi le jus de lichi n'est pas bon?",
        points: 69,
        choices: [
            new Choice('Guillaume en boit', true),
            new Choice('Guillaume en a apporté 2 boites', true),
            new Choice("C'est du lichi", false),
            new Choice('Guillaume en a bu à 9h du matin', false),
        ],
    },
    {
        type: QuestionType.QCM,
        text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
        points: 42,
        choices: [
            new Choice('Les temps de compilation sont abominables', false),
            new Choice("C'est quoi cette question?", true),
            new Choice('Le javascript est une erreur.', true),
        ],
    },
    {
        type: QuestionType.QCM,
        text: 'Quel est mieux angular ou React?',
        points: 69,
        choices: [new Choice('Les deux sont horribles', false), new Choice('Angular?', true), new Choice('React', false)],
    },
    {
        type: QuestionType.QCM,
        text: "Comment utiliser Git d'une manière optimale?",
        points: 42,
        choices: [
            new Choice('Force push sur master', true),
            new Choice('Force push sur master', true),
            new Choice('Force push sur master', true),
            new Choice('Merge request sur une branche dev', false),
        ],
    },
    {
        type: QuestionType.QCM,
        text: 'Est-ce que nous avons fait tous ce que nous avons promis?',
        points: 69,
        choices: [new Choice('Oui', false), new Choice('Non', true)],
    },
];

export const QUESTION_PLACEHOLDER: Question = {
    type: QuestionType.QCM,
    text: 'What is the text to print?',
    points: 42,
    choices: [new Choice('hello_world', true), new Choice('test', false), new Choice('lorem_ipsum', false)],
};

export const EMPTY_QUESTION: Question = {
    type: QuestionType.Qcm,
    text: '',
    points: 0,
    choices: [],
};
