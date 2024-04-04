// We need to disable max-lines because we need every single test to test thoroughly the service and have a good coverage
/* eslint-disable max-lines */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { RESPONSE_OK } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { GAME_PLACEHOLDER, Game } from '@common/interfaces/game';
import { QUESTIONS_PLACEHOLDER, QuestionWithModificationDate } from '@common/interfaces/question';
describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should toggle game visibility', () => {
        const gameId = '123';

        service.toggleGameVisibility(gameId).subscribe({
            next: (response) => {
                expect(response.body).toBe('');
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('PATCH');
        req.flush('');
    });

    it('should delete a game', () => {
        const gameId = 'test-id';

        service.deleteGame(gameId).subscribe({
            next: (response) => {
                expect(response.body).toBe('');
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush('');
    });

    it('should export a game', () => {
        const gameId = 'export-id';

        service.exportGame(gameId).subscribe({
            next: (response) => {
                expect(response.body).toBeInstanceOf(String);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('text');
        req.flush('');
    });

    it('should get admin games', () => {
        service.getAdminGames().subscribe({
            next: (response) => {
                expect(response.ok).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/admin/game`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should get games', () => {
        service.getGames().subscribe({
            next: (response) => {
                expect(response.ok).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should throw an error when getting games', () => {
        service.getGames().subscribe({
            next: (response) => {
                expect(response.ok).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('GET');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should throw an error when getting admin games', () => {
        service.getAdminGames().subscribe({
            next: (response) => {
                expect(response.ok).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/admin/game`);
        expect(req.request.method).toBe('GET');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should get game by id', () => {
        const gameId = 'test-id';

        service.getGameByID(gameId).subscribe({
            next: (response) => {
                expect(response.ok).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should throw an error when getting game by id', () => {
        const gameId = 'test-id';

        service.getGameByID(gameId).subscribe({
            next: (response) => {
                expect(response.ok).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('GET');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should add a game', () => {
        const game = GAME_PLACEHOLDER;

        service.addGame(game).subscribe({
            next: (response) => {
                expect(response.body).toBe('');
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('POST');
        req.flush('');
    });

    it('should login', () => {
        const password = 'password';

        service.login(password).subscribe({
            next: (response) => {
                expect(response).toBeTrue();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}/admin`);
        expect(req.request.method).toBe('POST');
        req.flush('');
    });

    it('should throw an error when logging in', () => {
        const mockPassword = 'password';

        service.login(mockPassword).subscribe({
            next: (response) => {
                expect(response).toBeFalse();
            },
        });

        const mockError = new ProgressEvent('network error');
        const mockUrl = `${baseUrl}/admin`;
        const mockRequest = { password: mockPassword };

        const req = httpMock.expectOne(mockUrl);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(mockRequest);

        req.error(mockError);
    });

    it('should add a question', () => {
        const question = QUESTIONS_PLACEHOLDER[0];

        service.addQuestion(question).subscribe({
            next: (response) => {
                expect(response.body).toEqual(question);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/question`);
        expect(req.request.method).toBe('POST');
        req.flush(question);
    });

    it('should get game by id', () => {
        const gameId = 'test-id';

        service.getGameById(gameId).subscribe({
            next: (response) => {
                expect(response).toBeInstanceOf(Object);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should catch error when editing game', () => {
        const updatedGame: Game = {
            ...GAME_PLACEHOLDER,
            title: 'Updated Title',
            description: 'Updated Description',
        };

        service.editGame(updatedGame).subscribe({
            error: (error) => {
                expect(error).toBeTruthy();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual(updatedGame);
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should verify title', () => {
        const title = 'title';

        service.verifyTitle(title).subscribe({
            next: (response) => {
                expect(response).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/verify/`);
        expect(req.request.method).toBe('POST');
        req.flush(true);
    });

    it('should throw an error when verifying title', () => {
        const title = 'title';

        service.verifyTitle(title).subscribe({
            next: (response) => {
                expect(response).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/verify/`);
        expect(req.request.method).toBe('POST');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should get all questions', () => {
        service.getAllQuestionsWithModificationDates().subscribe({
            next: (response) => {
                expect(response.ok).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/question`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should send a patch request to update a game and return the updated game', () => {
        const updatedGame: Game = {
            ...GAME_PLACEHOLDER,
            title: 'Updated Title',
            description: 'Updated Description',
        };

        service.editGame(updatedGame).subscribe({
            next: (response) => {
                expect(response.body).toEqual(updatedGame);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual(updatedGame);
        req.flush(updatedGame);
    });

    it('should throw an error when getting all questions', () => {
        service.getAllQuestionsWithModificationDates().subscribe({
            next: (response) => {
                expect(response.ok).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/question`);
        expect(req.request.method).toBe('GET');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should delete a question', () => {
        const text = 'test-text';

        service.deleteQuestion(text).subscribe({
            next: (response) => {
                expect(response.body).toBe('');
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/question/${text}`);
        expect(req.request.method).toBe('DELETE');
        req.flush('');
    });

    it('should get answers', () => {
        const gameId = 'test-id';

        service.getAnswers(gameId).subscribe({
            next: (response) => {
                expect(response).toBeTruthy();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/question?questionText=${gameId}`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should modify a question', () => {
        const updatedQuestionData: QuestionWithModificationDate = {
            choices: [
                {
                    text: "Guillaume dit n'importe quoi",
                    isCorrect: false,
                },
                {
                    text: 'Guillaume a juste casse encore',
                    isCorrect: false,
                },
                {
                    text: 'Guillaum ne peut plus toucher au serveur',
                    isCorrect: true,
                },
                {
                    text: 'Guillaume',
                    isCorrect: false,
                },
            ],
            text: 'Pourquoi le patch fonctionne',
            type: QuestionType.QCM,
            points: 40,
            lastModification: new Date('2024-02-13T15:54:34.948Z'),
            mongoId: '65caec096c7ce91a0482e745',
        };
        service.modifyQuestion(updatedQuestionData).subscribe({
            next: (response) => {
                expect(response.status).toBe(RESPONSE_OK);
                expect(response.body).toEqual(updatedQuestionData);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/question`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(updatedQuestionData);
        req.flush(updatedQuestionData);
    });

    it('should get histories', () => {
        service.getHistories().subscribe({
            next: (response) => {
                expect(response.ok).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/history`);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should throw an error when getting histories', () => {
        service.getHistories().subscribe({
            next: (response) => {
                expect(response.ok).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/history`);
        expect(req.request.method).toBe('GET');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should delete histories', () => {
        service.deleteHistories().subscribe({
            next: (response) => {
                expect(response.ok).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/history`);
        expect(req.request.method).toBe('DELETE');
        req.flush('');
    });

    it('should throw an error when deleting histories', () => {
        service.deleteHistories().subscribe({
            next: (response) => {
                expect(response.ok).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/history`);
        expect(req.request.method).toBe('DELETE');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should return true for canCreateRandom when succes', () => {
        service.canCreateRandom().subscribe({
            next: (response) => {
                expect(response).toBeTrue();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/random`);
        expect(req.request.method).toBe('GET');
        req.flush(true, { status: 200, statusText: 'OK' });
    });

    it('should return false for canCreateRandom when failed', () => {
        service.canCreateRandom().subscribe({
            next: (response) => {
                expect(response).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/random`);
        expect(req.request.method).toBe('GET');
        req.flush(false, { status: 200, statusText: 'OK' });
    });

    it('should return false for canCreateRandom when error', () => {
        service.canCreateRandom().subscribe({
            next: (response) => {
                expect(response).toBeFalse();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/random`);
        expect(req.request.method).toBe('GET');
        req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });
});
