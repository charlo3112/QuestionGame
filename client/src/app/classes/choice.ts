export class Choice {
    text: string;
    isSelected: boolean;
    isCorrect: boolean;
    constructor(text: string, isCorrect: boolean) {
        this.text = text;
        this.isSelected = false;
        this.isCorrect = isCorrect;
    }
}
