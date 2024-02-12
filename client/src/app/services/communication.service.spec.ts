import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GAME_PLACEHOLDER } from '@app/interfaces/game';
import { QUESTION_PLACEHOLDER } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';

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
                expect(response.body).toBe(''); // DELETE might not return a body
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
                expect(response.body).toBe('');
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/admin`);
        expect(req.request.method).toBe('POST');
        req.flush('');
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

    it('should add a question', () => {
        const question = QUESTION_PLACEHOLDER;

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
});
