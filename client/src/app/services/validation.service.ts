import { Injectable } from '@angular/core';
import { Choice } from '@app/classes/choice';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { Result } from '@app/interfaces/result';
import { QuestionType } from '@common/constants';

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

        if (!question.points) {
            errors.push('La question doit avoir un nombre de points.');
        }

        if (!question.type) {
            errors.push('La question doit avoir un type.');
        } else if (!Object.values(QuestionType).includes(question.type)) {
            errors.push('La question doit avoir un type valide.');
        }

        if (question.type === QuestionType.QCM) {
            if (!Array.isArray(question.choices)) {
                errors.push('Les choix de la question doivent être un tableau.');
            } else {
                const choices = question.choices;
                if (choices.length === 0) {
                    errors.push('La question doit avoir au moins un choix.');
                }
                for (let j = 0; j < choices.length; j++) {
                    const choice = choices[j];
                    if (!choice.text || choice.text === '') {
                        errors.push(`Le choix ${j + 1} de la question doit avoir un texte.`);
                    }
                }
            }
        }

        return errors;
    }

    filterJSONInput(jsonString: string): Result<Partial<Game>> {
        try {
            const parsedInput: Partial<Game> = JSON.parse(jsonString);

            const filteredOutput: Partial<Game> = {
                title: parsedInput.title,
                description: parsedInput.description,
                duration: parsedInput.duration,
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
