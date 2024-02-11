import { Choice } from '@app/classes/choice';
import { QuestionType } from '@app/enums/question-type';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
}
