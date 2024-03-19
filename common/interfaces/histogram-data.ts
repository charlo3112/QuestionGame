import { Question } from './question';

export interface HistogramData {
    choicesCounters: number[][];
    question: Question[];
    indexCurrentQuestion: number;
}
