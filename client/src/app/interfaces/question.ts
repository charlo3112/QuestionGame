import { QuestionType } from '@app/enums/question-type';
import { Choice } from './choice';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
}
