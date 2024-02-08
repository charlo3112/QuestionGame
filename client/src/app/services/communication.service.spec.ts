import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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
        const visibility = true;

        service.toggleGameVisibility(gameId, visibility).subscribe({
            next: (response) => {
                expect(response.body).toBe(''); // PATCH might not return a body
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual({ value: visibility });
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
                expect(response.body instanceof Blob).toBe(true);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${gameId}`);
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('blob');
        req.flush(new Blob(['{}'], { type: 'application/json' }));
    });
});
