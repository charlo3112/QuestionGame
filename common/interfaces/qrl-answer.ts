import { Grade } from '../enums/grade';

export interface QrlAnswer {
    user: string;
    text: string;
    grade: Grade;
}
