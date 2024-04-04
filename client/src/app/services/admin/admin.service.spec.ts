import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AdminService } from '@app/services/admin/admin.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SessionStorageService } from '@app/services/session-storage/session-storage.service';
import { Choice } from '@common/interfaces/choice';
import { GAME_PLACEHOLDER, Game } from '@common/interfaces/game';
import { Question } from '@common/interfaces/question';
import { of, throwError } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('AdminService', () => {
    let adminService: AdminService;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let sessionStorageServiceSpy: SpyObj<SessionStorageService>;

    let mockLogin: boolean;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['deleteGame', 'exportGame', 'toggleGameVisibility']);
        sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['login']);
        Object.defineProperty(sessionStorageServiceSpy, 'login', {
            get: jasmine.createSpy('login.get').and.callFake(() => mockLogin),
            set: jasmine.createSpy('login.set').and.callFake((value) => {
                mockLogin = value;
            }),
        });

        mockLogin = false;

        TestBed.configureTestingModule({
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
            ],
        });
        adminService = TestBed.inject(AdminService);
    });

    it('should be created', () => {
        expect(adminService).toBeTruthy();
    });

    it('should resolve promise when deleteGame succeeds', async () => {
        communicationServiceSpy.deleteGame.and.returnValue(of(new HttpResponse<string>({ status: HttpStatusCode.Ok })));
        await expectAsync(adminService.deleteGame('id')).toBeResolved();
    });

    it('should reject promise when deleteGame fails', async () => {
        communicationServiceSpy.deleteGame.and.returnValue(throwError(() => new HttpResponse<string>({ status: HttpStatusCode.NotFound })));
        await expectAsync(adminService.deleteGame('id')).toBeRejected();
    });

    it('should resolve promise when exportGame succeeds when response exists', async () => {
        const filteredOutput: Partial<Game> = {
            title: GAME_PLACEHOLDER.title,
            description: GAME_PLACEHOLDER.description,
            duration: GAME_PLACEHOLDER.duration,
            questions: GAME_PLACEHOLDER.questions.map((question: Question) => ({
                type: question.type,
                text: question.text,
                points: question.points,
                choices: question.choices?.map((choice: Choice) => ({
                    text: choice.text,
                    isCorrect: choice.isCorrect,
                })),
            })),
        };

        const mockResponse: HttpResponse<string> = new HttpResponse({
            status: HttpStatusCode.Ok,
            body: JSON.stringify(GAME_PLACEHOLDER),
        });
        communicationServiceSpy.exportGame.and.returnValue(of(mockResponse));
        const result = await adminService.exportGame(GAME_PLACEHOLDER.gameId);
        expect(result).toEqual(filteredOutput);
    });

    it('should resolve promise when exportGame succeeds when response does not exist', async () => {
        const mockResponse = { status: HttpStatusCode.Ok, body: null };
        communicationServiceSpy.exportGame.and.returnValue(of(new HttpResponse<string>(mockResponse)));
        const result = await adminService.exportGame('id');
        expect(result).toBeNull();
    });

    it('should reject promise when exportGame fails', async () => {
        communicationServiceSpy.exportGame.and.returnValue(throwError(() => new HttpResponse<string>({ status: HttpStatusCode.NotFound })));
        await expectAsync(adminService.exportGame('id')).toBeRejected();
    });

    it('should resolve promise when toggleGameVisibility succeeds', async () => {
        const mockResponse = { status: HttpStatusCode.Ok, body: JSON.stringify({ visibility: true }) };
        communicationServiceSpy.toggleGameVisibility.and.returnValue(of(new HttpResponse<string>(mockResponse)));
        const result = await adminService.toggleGameVisibility('id');
        expect(result).toBeTrue();
    });

    it('should reject promise when toggleGameVisibility fails', async () => {
        communicationServiceSpy.toggleGameVisibility.and.returnValue(throwError(() => new HttpResponse<string>({ status: HttpStatusCode.NotFound })));
        await expectAsync(adminService.toggleGameVisibility('id')).toBeRejected();
    });

    it('should download a file', () => {
        const data: Partial<Game> = {
            title: 'Test Game',
            description: 'Test Description',
            duration: 60,
        };
        const filename = 'test-file.json';

        spyOn(URL, 'createObjectURL').and.callThrough();
        spyOn(URL, 'revokeObjectURL').and.callThrough();

        adminService.downloadFile(data, filename);

        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should update sessionStorage with the provided success value', () => {
        const success = true;
        adminService.handleLogin(success);

        expect(sessionStorageServiceSpy.login).toBeTrue();
    });

    it('should get the login value from sessionStorage', () => {
        mockLogin = true;
        expect(adminService.login).toBeTrue();
        mockLogin = false;
        expect(adminService.login).toBeFalse();
    });
});
