import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private questions: Question[];
    private i: number = 0;

    setQuestions(newQuestions: Question[]) {
        this.questions = newQuestions;
    }

    getCurrent(): Question | undefined {
        if (this.i > this.questions.length) {
            return undefined;
        }
        return this.questions[this.i];
    }

    next() {
        ++this.i;
    }
}
