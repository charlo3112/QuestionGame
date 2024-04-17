/* eslint-disable max-params */
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NOT_FOUND, SNACKBAR_DURATION } from '@common/constants';
import { Question } from '@common/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class QuestionInsertionService {
    // We need all the parameters to make the service work
    // eslint-disable-next-line max-params
    constructor(private snackBar: MatSnackBar) {}

    insertQuestion(question: Question, questions: Question[]): void {
        const index = questions.findIndex((q) => q.text === question.text);
        if (index > NOT_FOUND) {
            questions[index] = question;
        } else {
            questions.push(question);
        }
    }

    insertQuestionFromBank(question: Question, isEditingQuestion: boolean, questions: Question[]): void {
        if (this.verifyQuestion(question, questions, isEditingQuestion)) {
            this.insertQuestion(question, questions);
        }
    }

    insertQuestionFromCreate(question: Question, isEditingQuestion: boolean, questionTitleToEdit: string, questions: Question[]): void {
        if (this.verifyQuestion(question, questions, isEditingQuestion)) {
            if (!questionTitleToEdit.length) {
                if (question.points === 0) {
                    question.points = 10;
                }
                this.insertQuestion(question, questions);
            } else {
                const index = questions.findIndex((q) => q.text === questionTitleToEdit);
                questions[index] = question;
                questionTitleToEdit = '';
                isEditingQuestion = false;
            }
        }
    }

    deleteQuestion(index: number, questions: Question[]): void {
        questions.splice(index, 1);
    }

    verifyQuestion(question: Question, questions: Question[], isEditingQuestion: boolean): boolean {
        const SAME_TEXT_QUESTION = "Une question avec le même texte est déjà présente ! Votre question n'a pas été ajoutée.";
        const index = questions.findIndex((q) => q.text === question.text);
        if (index !== NOT_FOUND) {
            if (isEditingQuestion) {
                return true;
            }
            this.snackBar.open(SAME_TEXT_QUESTION, undefined, {
                duration: SNACKBAR_DURATION,
            });
            return false;
        } else {
            return true;
        }
    }
}
