import { Injectable } from '@angular/core';
import { Choice } from '@app/classes/choice';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import {
    MAX_CHOICES_NUMBER,
    MAX_DURATION,
    MAX_NB_OF_POINTS,
    MIN_CHOICES_NUMBER,
    MIN_DURATION,
    MIN_NB_OF_POINTS,
    PONDERATION_INCREMENT,
    QuestionType,
} from '@common/constants';
import { Result } from '@common/result';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    validateGame(game: Partial<Game>): string[] {
        const errors: string[] = [];

        if (!game.title) {
            errors.push('Le nom du jeu est requis.');
        }

        if (!game.description) {
            errors.push('La description du jeu est requise.');
        }

        if (!game.duration) {
            errors.push('La durée du jeu est requise.');
        } else if (game.duration > MAX_DURATION || game.duration < MIN_DURATION || !Number.isInteger(game.duration)) {
            errors.push('Le temps alloué aux questions est mauvais.');
        }

        if (!Array.isArray(game.questions)) {
            errors.push('Les questions doivent être un tableau.');
        } else {
            const questions = game.questions;
            if (questions.length === 0) {
                errors.push('Le jeu doit avoir au moins une question.');
            }
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                const questionErrors = this.validateQuestion(question);
                if (questionErrors.length > 0) {
                    errors.push(`Question ${i + 1}:`);
                    errors.push(...questionErrors);
                }
            }
        }
        return errors;
    }

    validateQuestion(question: Partial<Question>): string[] {
        const errors: string[] = [];

        if (!question.text) {
            errors.push('La question doit avoir un texte.');
        }
        this.checkPoints(question, errors);
        if (!question.type) {
            errors.push('La question doit avoir un type.');
        } else if (!Object.values(QuestionType).includes(question.type)) {
            errors.push('La question doit avoir un type valide.');
        }

        this.checkQCM(question, errors);

        return errors;
    }

    checkPoints(question: Partial<Question>, errors: string[]): void {
        if (question.points === undefined || question.points === null) {
            errors.push('La question doit avoir un nombre de points.');
        } else if (question.points > MAX_NB_OF_POINTS || question.points < MIN_NB_OF_POINTS) {
            errors.push('Les points doivent être compris entre 10 et 100.');
        } else if (question.points % PONDERATION_INCREMENT !== 0) {
            errors.push('Les points doivent être un multiple de 10.');
        }
    }

    checkQCM(question: Partial<Question>, errors: string[]): void {
        if (question.type === QuestionType.QCM) {
            if (!Array.isArray(question.choices)) {
                errors.push('Les choix de la question doivent être un tableau.');
            } else {
                const choices = question.choices;
                if (choices.length < MIN_CHOICES_NUMBER) {
                    errors.push('La question doit avoir au minimum deux choix.');
                }
                if (choices.length > MAX_CHOICES_NUMBER) {
                    errors.push('La question doit avoir au maximum quatre choix.');
                }
                let answer = 0;
                for (let j = 0; j < choices.length; j++) {
                    const choice = choices[j];
                    if (choice.isCorrect) {
                        answer++;
                    }
                    if (!choice.text || choice.text === '') {
                        errors.push(`Le choix ${j + 1} de la question doit avoir un texte.`);
                    }
                }
                if (answer === 0 || answer === choices.length) {
                    errors.push('Les choix de réponse sont fautifs');
                }
            }
        }
    }

    filterJSONInput(jsonString: string): Result<Partial<Game>> {
        try {
            const parsedInput: Partial<Game> = JSON.parse(jsonString);

            const filteredOutput: Partial<Game> = {
                title: parsedInput.title,
                description: parsedInput.description,
                duration: parsedInput.duration,
                visibility: false,
                lastModification: parsedInput.lastModification,
                questions: parsedInput.questions?.map((question) => ({
                    type: question.type,
                    text: question.text,
                    points: question.points,
                    choices: question.choices?.map((choice) => new Choice(choice.text, choice.isCorrect)),
                })),
            };

            return { ok: true, value: filteredOutput };
        } catch (error) {
            const message = 'Invalid JSON';
            return { ok: false, error: message };
        }
    }
}
