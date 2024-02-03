import { Schema } from '@nestjs/mongoose';

@Schema()
export class Choice {
    #text: string;
    #isCorrect: boolean;

    constructor(text: string, isCorrect: boolean) {
        if (text !== undefined && text.length > 0) {
            this.#text = text;
        }
        this.#isCorrect = isCorrect;
    }

    set text(newText: string) {
        if (newText.length > 0) {
            this.#text = newText;
        }
    }

    set isCorrect(newAnswer: boolean) {
        this.#isCorrect = newAnswer;
    }

    getText(): string {
        return this.#text;
    }

    getIsCorrect(): boolean {
        return this.#isCorrect;
    }
}
