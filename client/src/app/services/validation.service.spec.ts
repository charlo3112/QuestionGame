import { Game } from '@app/interfaces/game';
import { Question, QuestionType } from '@app/interfaces/question';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;
    let mockValidQuestion1: Question;
    let mockValidQuestion2: Question;

    beforeEach(() => {
        service = new ValidationService();
        mockValidQuestion1 = {
            text: 'Quelle est la capitale du Canada ?',
            points: 10,
            choices: [
                { text: 'Ottawa', isCorrect: true },
                { text: 'Toronto', isCorrect: false },
            ],
            type: QuestionType.Qcm,
        };
        mockValidQuestion2 = {
            text: 'Quelle est la capitale de la France ?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'Marseille', isCorrect: false },
            ],
            type: QuestionType.Qcm,
        };
    });

    describe('validateGame', () => {
        it('should validate a complete game object without errors', () => {
            const game = {
                title: 'Test Game',
                description: 'Test Description',
                duration: 60,
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

        it('should report error for game duration too short', () => {
            const game = {
                title: 'Test Game',
                description: 'Test Description',
                duration: 5,
                questions: [mockValidQuestion1, mockValidQuestion2],
            } as unknown as Partial<Game>;
            const errors = service.validateGame(game);
            expect(errors).toContain('Le temps alloué aux questions est mauvais.');
        });

        it('should report error for game duration too long', () => {
            const game = {
                title: 'Test Game',
                description: 'Test Description',
                duration: 65,
                questions: [mockValidQuestion1, mockValidQuestion2],
            } as unknown as Partial<Game>;
            const errors = service.validateGame(game);
            expect(errors).toContain('Le temps alloué aux questions est mauvais.');
        });

        it('should report error for game duration being a decimal', () => {
            const game = {
                title: 'Test Game',
                description: 'Test Description',
                duration: 20.5,
                questions: [mockValidQuestion1, mockValidQuestion2],
            } as unknown as Partial<Game>;
            const errors = service.validateGame(game);
            expect(errors).toContain('Le temps alloué aux questions est mauvais.');
        });

        it('should report error for question points too low', () => {
            const question = {
                text: 'Test Question',
                points: 0,
                type: 'QCM',
                choices: [mockValidQuestion1, mockValidQuestion2],
            } as unknown as Partial<Question>;
            const errors = service.validateQuestion(question);
            expect(errors).toContain('Les points doivent être compris entre 10 et 100.');
        });

        it('should report error for question points too high', () => {
            const question = {
                text: 'Test Question',
                points: 110,
                type: 'QCM',
                choices: [mockValidQuestion1, mockValidQuestion2],
            } as unknown as Partial<Question>;
            const errors = service.validateQuestion(question);
            expect(errors).toContain('Les points doivent être compris entre 10 et 100.');
        });

        it('should report error for question points not being a multiple of 10', () => {
            const question = {
                text: 'Test Question',
                points: 25,
                type: 'QCM',
                choices: [mockValidQuestion1, mockValidQuestion2],
            } as unknown as Partial<Question>;
            const errors = service.validateQuestion(question);
            expect(errors).toContain('Les points doivent être un multiple de 10.');
        });
    });

    describe('validateQuestion', () => {
        it('should validate a complete question object without errors', () => {
            const question = {
                text: 'What is the capital of France?',
                points: 10,
                type: 'QCM',
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'Marseille', isCorrect: false },
                ],
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

        it('should report that it needs at least two choices', () => {
            const question = { type: 'QCM', choices: [] };
            const errors = service.validateQuestion(question as unknown as Partial<Question>);
            expect(errors).toContain('La question doit avoir au minimum deux choix.');
        });

        it('should report that it needs a maximum of 4 choices', () => {
            const question = {
                type: 'QCM',
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'Marseille', isCorrect: false },
                    { text: 'Lyon', isCorrect: false },
                    { text: 'Toulouse', isCorrect: false },
                    { text: 'Nice', isCorrect: false },
                ],
            } as unknown as Partial<Question>;
            const errors = service.validateQuestion(question);
            expect(errors).toContain('La question doit avoir au maximum quatre choix.');
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
                duration: 60,
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
                visibility: false,
                duration: 60,
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
