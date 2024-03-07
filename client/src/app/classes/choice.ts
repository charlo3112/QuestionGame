export class Choice {
    text: string;
    isCorrect: boolean;
    constructor(text: string, isCorrect: boolean) {
        this.text = text;
        this.isCorrect = isCorrect;
    }
}
export class ChoiceWithCounter extends Choice {
    counter: number;
    constructor(text: string, isCorrect: boolean, counter: number) {
        super(text, isCorrect);
        this.counter = counter;
    }
}
