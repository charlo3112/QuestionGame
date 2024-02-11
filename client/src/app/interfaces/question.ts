import { Choice } from './choice';

export enum QuestionType {
    Qcm = 'QCM',
    Qrl = 'QRL',
}

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
}

export interface QuestionWithModificationDate extends Question {
    lastModification: Date;
}

export const QUESTION_PLACEHOLDER: Question = {
    type: QuestionType.Qcm,
    text: 'What is the text to print?',
    points: 42,
    choices: [{ text: 'hello_world' }, { text: 'test' }, { text: 'lorem_ipsum' }],
};
