import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { SNACKBAR_DURATION } from '@common/constants';
import { Game } from '@common/interfaces/game';
import { QUESTIONS_PLACEHOLDER } from '@common/interfaces/question';
import { of } from 'rxjs';
import { GameCreationService } from './game-creation.service';

describe('GameCreationService', () => {
    let service: GameCreationService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let validationServiceSpy: jasmine.SpyObj<ValidationService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['addGame', 'editGame']);
        validationServiceSpy = jasmine.createSpyObj('ValidationService', ['validateGame']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                GameCreationService,
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: ValidationService, useValue: validationServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(GameCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('save method', () => {
        const game: Game = {
            gameId: 'game_id',
            title: 'Game title',
            description: 'Game description',
            duration: 10,
            lastModification: '01-01-2024',
            questions: QUESTIONS_PLACEHOLDER,
            image: 'assets/logo.png',
            visibility: true,
        };

        const ERROR_CREATING_GAME = 'Erreur lors de la création du jeu';
        const ERROR_UPDATING_GAME = 'Erreur lors de la modification du jeu';

        it('should create game when not editing', async () => {
            validationServiceSpy.validateGame.and.returnValue([]);
            communicationServiceSpy.addGame.and.returnValue(of(new HttpResponse<string>()));
            await service.save(game.title, game.description, game.duration, game.questions, game.visibility, '', false);
            expect(communicationServiceSpy.addGame).toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalledOnceWith('Le jeu a été créé avec succès !', undefined, jasmine.any(Object));
            expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/admin']);
        });

        it('should update game when editing', async () => {
            validationServiceSpy.validateGame.and.returnValue([]);
            communicationServiceSpy.editGame.and.returnValue(of(new HttpResponse<Game>()));

            await service.save(game.title, game.description, game.duration, game.questions, game.visibility, game.gameId, true);

            expect(communicationServiceSpy.editGame).toHaveBeenCalled();
            expect(snackBarSpy.open).toHaveBeenCalledOnceWith('Le jeu a été modifié avec succès !', undefined, jasmine.any(Object));
            expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/admin']);
        });

        it('should show validation errors in snackbar', async () => {
            validationServiceSpy.validateGame.and.returnValue(['Validation Error 1', 'Validation Error 2']);

            await service.save(game.title, game.description, game.duration, [], game.visibility, '', false);

            expect(snackBarSpy.open).toHaveBeenCalledOnceWith(
                'Erreurs de validation: \nValidation Error 1\nValidation Error 2',
                undefined,
                jasmine.any(Object),
            );
            expect(communicationServiceSpy.addGame).not.toHaveBeenCalled();
            expect(communicationServiceSpy.editGame).not.toHaveBeenCalled();
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });

        it('should display error message if game creation fails', async () => {
            const error = new Error('Game creation failed');
            communicationServiceSpy.addGame.and.throwError(error);

            await service.createGame(game);

            expect(snackBarSpy.open).toHaveBeenCalledWith(ERROR_CREATING_GAME, undefined, {
                duration: SNACKBAR_DURATION,
            });
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });

        it('should display error message if game update fails', async () => {
            const error = new Error('Game creation failed');
            communicationServiceSpy.addGame.and.throwError(error);

            await service.updateGame(game);

            expect(snackBarSpy.open).toHaveBeenCalledWith(ERROR_UPDATING_GAME, undefined, {
                duration: SNACKBAR_DURATION,
            });
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });
    });
});
