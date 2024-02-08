import { Game } from '@app/interfaces/game';
import { QuestionType } from '@app/interfaces/question';

type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export class GameValidationService {
    validateGame(data: string): string[] {
        const errors: string[] = [];
        let game;
        try {
            game = JSON.parse(data);
        } catch (error) {
            errors.push('Le format du jeu est invalide.');
            return errors;
        }

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
                const questionErrors = this.validateQuestion(JSON.stringify(question));
                if (questionErrors.length > 0) {
                    errors.push(`Question ${i + 1}:`);
                    errors.push(...questionErrors);
                }
            }
        }

        return errors;
    }

    validateQuestion(data: string): string[] {
        const errors: string[] = [];
        let question;
        try {
            question = JSON.parse(data);
        } catch (error) {
            errors.push('Le format de la question est invalide.');
            return errors;
        }

        if (!question.text) {
            errors.push('La question doit avoir un texte.');
        }

        if (!question.points) {
            errors.push('La question doit avoir un nombre de points.');
        }

        if (!Object.values(QuestionType).includes(question.type)) {
            errors.push('La question doit avoir un type valide.');
        }

        if (question.type === QuestionType.Qcm) {
            if (!Array.isArray(question.choices)) {
                errors.push('Les choix de la question doivent être un tableau.');
            } else {
                const choices = question.choices;
                if (choices.length === 0) {
                    errors.push('La question doit avoir au moins un choix.');
                }
                for (let j = 0; j < choices.length; j++) {
                    const choice = choices[j];
                    if (!choice.text) {
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
                isVisible: false,
                duration: parsedInput.duration,
                lastModification: parsedInput.lastModification,
                questions: parsedInput.questions?.map((question) => ({
                    type: question.type,
                    text: question.text,
                    points: question.points,
                    choices: question.choices?.map((choice) => ({
                        text: choice.text,
                        isCorrect: choice.isCorrect,
                    })),
                })),
            };

            return { ok: true, value: filteredOutput };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid JSON';
            return { ok: false, error: message };
        }
    }
}
