import { Grade } from '../enums/grade';

export interface QrlAnswer {
    player: string;
    text: string;
    grade: Grade;
}
