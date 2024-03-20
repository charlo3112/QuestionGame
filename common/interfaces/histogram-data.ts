import { QuestionType } from '@common/enums/question-type';
import { Question } from './question';

export interface HistogramData {
    choicesCounters: number[][];
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
            type: QuestionType.QCM,
            text: 'Pourquoi le jus de lichi est bon?',
            points: 69,
            choices: [
                { text: 'Guillaume en boit', isCorrect: true },
                { text: 'Guillaume en a apporté 2 boites', isCorrect: false },
                { text: "C'est du lichi", isCorrect: false },
                { text: 'Guillaume en a bu à 9h du matin', isCorrect: false },
            ],
        },
    ],
    indexCurrentQuestion: 0,
    choicesCounters: [
        [10, 0, 0, 0],
        [0, 0, 10, 0],
    ],
};
