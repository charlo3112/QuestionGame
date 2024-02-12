import { Choice } from '@app/classes/choice';
import { QuestionType } from '@app/enums/question-type';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
}

export const questions: Question[] = [
    {
        type: QuestionType.Qcm,
        text: "Pourquoi le jus de lichi n'est pas bon?",
        points: 8,
        choices: [
            new Choice('Guillaume en boit', true),
            new Choice('Guillaume en a apporté 2 boites', true),
            new Choice("C'est du lichi", false),
            new Choice('Guillaume en a bu à 9h du matin', false),
        ],
    },
    {
        type: QuestionType.Qcm,
        text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
        points: 8,
        choices: [
            new Choice('Les temps de compilation sont abominables', false),
            new Choice("C'est quoi cette question?", true),
            new Choice('Le javascript est une erreur.', true),
        ],
    },
    {
        type: QuestionType.Qcm,
        text: 'Quel est mieux angular ou React?',
        points: 8,
        choices: [new Choice('Les deux sont horribles', false), new Choice('Angular?', true), new Choice('React', false)],
    },
    {
        type: QuestionType.Qcm,
        text: "Comment utiliser Git d'une manière optimale?",
        points: 8,
        choices: [
            new Choice('Force push sur master', true),
            new Choice('Force push sur master', true),
            new Choice('Force push sur master', true),
            new Choice('Merge request sur une branche dev', false),
        ],
    },
    {
        type: QuestionType.Qcm,
        text: 'Est-ce que nous avons fait tous ce que nous avons promis?',
        points: 8,
        choices: [new Choice('Oui', false), new Choice('Non', true)],
    },
];
