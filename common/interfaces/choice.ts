export interface Choice {
    text: string;
    isCorrect?: boolean;
}
export interface ChoiceWithCounter extends Choice {
    counter: number;
}
