import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { Question } from './question';

export interface HistogramQCM {
    type: QuestionType.QCM;
    choicesCounters: number[];
}

export interface HistogramQRL {
    type: QuestionType.QRL;
    active: number;
    inactive: number;
    grades: Grade[];
}

export type Histogram = HistogramQCM | HistogramQRL;

export interface HistogramData {
    histogram: Histogram[];
    question: Question[];
    indexCurrentQuestion: number;
}

export const HISTOGRAM_DATA: HistogramData = {
    question: [
        {
            type: QuestionType.QCM,
            text: "Pourquoi le jus de lichi n'est pas bon?",
            points: 69,
            choices: [
                { text: 'Guillaume en boit', isCorrect: true },
                { text: 'Guillaume en a apporté 2 boites', isCorrect: false },
                { text: "C'est du lichi", isCorrect: false },
                { text: 'Guillaume en a bu à 9h du matin', isCorrect: false },
            ],
        },
        {
            type: QuestionType.QRL,
            text: 'Pourquoi le jus de lichi est bon?',
            points: 69,
        },
    ],
    indexCurrentQuestion: 0,
    histogram: [
        {
            type: QuestionType.QCM,
            choicesCounters: [0, 10, 0, 0],
        },
        {
            type: QuestionType.QRL,
            active: 1,
            inactive: 2,
            grades: [Grade.Zero, Grade.Half, Grade.One],
        },
    ],
};
