import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;

    beforeEach(() => {
        service = new ValidationService();
    });

    describe('validateGame', () => {
        it('should validate a complete game object without errors', () => {
            const game = {
                title: 'Test Game',
                description: 'Test Description',
                duration: 120,
                questions: [
                    {
                        text: 'Test Question',
                        points: 10,
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                        ],
                    },
                ],
            } as unknown as Partial<Game>;
            expect(service.validateGame(game)).toEqual([]);
        });

        it('should report missing title, description, duration, and questions', () => {
            const game = {};
            const errors = service.validateGame(game as unknown as Partial<Game>);
            expect(errors).toContain('Le nom du jeu est requis.');
            expect(errors).toContain('La description du jeu est requise.');
            expect(errors).toContain('La durée du jeu est requise.');
            expect(errors).toContain('Les questions doivent être un tableau.');
        });

        it('should report that it needs at least one question', () => {
            const game = { questions: [] };
            const errors = service.validateGame(game as unknown as Partial<Game>);
            expect(errors).toContain('Le jeu doit avoir au moins une question.');
        });

        it('should report errors for each question', () => {
            const game = {
                questions: [{ text: 'Test Question', points: 10, type: 't', choices: [] }],
            } as unknown as Partial<Game>;
            const errors = service.validateGame(game);
            expect(errors).toContain('Question 1:');
            expect(errors).toContain('La question doit avoir un type valide.');
        });
    });

    describe('validateQuestion', () => {
        it('should validate a complete question object without errors', () => {
            const question = {
                text: 'What is the capital of France?',
                points: 5,
                type: 'QCM',
                choices: [{ text: 'Paris', isCorrect: true }],
            } as unknown as Partial<Question>;
            expect(service.validateQuestion(question)).toEqual([]);
        });

        it('should report missing text, points, and type', () => {
            const question = {};
            const errors = service.validateQuestion(question as unknown as Partial<Question>);
            expect(errors).toContain('La question doit avoir un texte.');
            expect(errors).toContain('La question doit avoir un nombre de points.');
            expect(errors).toContain('La question doit avoir un type.');
        });

        it('should report choices is required for QCM questions', () => {
            const question = { type: 'QCM' };
            const errors = service.validateQuestion(question as unknown as Partial<Question>);
            expect(errors).toContain('Les choix de la question doivent être un tableau.');
        });

        it('should report that it needs at least one choice', () => {
            const question = { type: 'QCM', choices: [] };
            const errors = service.validateQuestion(question as unknown as Partial<Question>);
            expect(errors).toContain('La question doit avoir au moins un choix.');
        });

        it('should report errors for each choice', () => {
            const question = {
                type: 'QCM',
                choices: [{ text: 'Paris', isCorrect: true }, { isCorrect: false }],
            } as unknown as Partial<Question>;
            const errors = service.validateQuestion(question);
            expect(errors).toContain('Le choix 2 de la question doit avoir un texte.');
        });
    });

    describe('filterJSONInput', () => {
        it('should return an error when the input is not a valid JSON', () => {
            const result = service.filterJSONInput('');
            expect(result).toEqual({ ok: false, error: 'Invalid JSON' });
        });

        it('should return a filtered game object when the input is valid', () => {
            const game = {
                id: 'game_id',
                test: 'test',
                title: 'Test Game',
                description: 'Test Description',
                duration: 120,
                lastModification: '2021-01-01',
                questions: [
                    {
                        text: 'Test Question',
                        points: 10,
                        type: 'QCM',
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                        ],
                    },
                ],
            } as unknown as Partial<Game>;

            const expectedGame = {
                title: 'Test Game',
                description: 'Test Description',
                duration: 120,
                lastModification: '2021-01-01',
                questions: [
                    {
                        type: 'QCM',
                        text: 'Test Question',
                        points: 10,
                        choices: [
                            { text: 'Choice 1', isCorrect: true },
                            { text: 'Choice 2', isCorrect: false },
                        ],
                    },
                ],
            } as unknown as Partial<Game>;
            const result = service.filterJSONInput(JSON.stringify(game));
            expect(result).toEqual({ ok: true, value: expectedGame });
        });
    });
});
