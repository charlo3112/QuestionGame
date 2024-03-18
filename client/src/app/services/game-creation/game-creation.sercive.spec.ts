// import { TestBed } from '@angular/core/testing';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Router } from '@angular/router';
// import { Game, GAME_PLACEHOLDER } from '@app/interfaces/game';
// import { Question } from '@app/interfaces/question';
// import { CommunicationService } from '@app/services/communication/communication.service';
// import { ValidationService } from '@app/services/validation/validation.service';
// import { SNACKBAR_DURATION } from '@common/constants';
// import { lastValueFrom } from 'rxjs';
// import { GameCreationService } from './game-creation.service';

// describe('GameCreationService', () => {
//     let service: GameCreationService;
//     let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
//     let validationServiceSpy: jasmine.SpyObj<ValidationService>;
//     let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
//     let routerSpy: jasmine.SpyObj<Router>;

//     beforeEach(() => {
//         const communicationServiceSpyObj = jasmine.createSpyObj('CommunicationService', ['addGame', 'editGame']);
//         const validationServiceSpyObj = jasmine.createSpyObj('ValidationService', ['validateGame']);
//         const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
//         const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

//         TestBed.configureTestingModule({
//             providers: [
//                 GameCreationService,
//                 { provide: CommunicationService, useValue: communicationServiceSpyObj },
//                 { provide: ValidationService, useValue: validationServiceSpyObj },
//                 { provide: MatSnackBar, useValue: snackBarSpyObj },
//                 { provide: Router, useValue: routerSpyObj },
//             ],
//         });

//         service = TestBed.inject(GameCreationService);
//         communicationServiceSpy = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
//         validationServiceSpy = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
//         snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
//         routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     describe('save', () => {
//         const newTitle = 'New Game';
//         const newDescription = 'This is a new game';
//         const newDuration = 60;
//         const newQuestions: Question[] = [];
//         const newVisibility = true;
//         const id = '123';
//         const isEditing = true;

//         it('should display validation errors if game is invalid', async () => {
//             const validationErrors = ['Invalid title', 'Invalid description'];
//             validationServiceSpy.validateGame.and.returnValue(validationErrors);

//             await service.save(newTitle, newDescription, newDuration, newQuestions, newVisibility, id, isEditing);

//             expect(snackBarSpy.open).toHaveBeenCalledWith(`Erreurs de validation: \n${validationErrors.join('\n')}`, undefined, {
//                 duration: SNACKBAR_DURATION,
//             });
//             expect(communicationServiceSpy.addGame).not.toHaveBeenCalled();
//             expect(communicationServiceSpy.editGame).not.toHaveBeenCalled();
//         });

//         it('should create a new game if not editing', async () => {
//             const game: Game = {
//                 ...GAME_PLACEHOLDER,
//                 title: newTitle,
//                 description: newDescription,
//                 duration: newDuration,
//                 questions: newQuestions,
//                 lastModification: new Date().toISOString(),
//                 visibility: newVisibility,
//             };
//             communicationServiceSpy.addGame.and.returnValue(Promise.resolve());

//             await service.save(newTitle, newDescription, newDuration, newQuestions, newVisibility, id, false);

//             expect(communicationServiceSpy.addGame).toHaveBeenCalledWith(game);
//             expect(snackBarSpy.open).toHaveBeenCalledWith('Le jeu a été créé avec succès !', undefined, {
//                 duration: SNACKBAR_DURATION,
//             });
//             expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
//         });

//         it('should update the game if editing', async () => {
//             const game: Game = {
//                 ...GAME_PLACEHOLDER,
//                 title: newTitle,
//                 description: newDescription,
//                 duration: newDuration,
//                 questions: newQuestions,
//                 lastModification: new Date().toISOString(),
//                 visibility: newVisibility,
//                 gameId: id,
//             };
//             communicationServiceSpy.editGame.and.returnValue(Promise.resolve());

//             await service.save(newTitle, newDescription, newDuration, newQuestions, newVisibility, id, true);

//             expect(communicationServiceSpy.editGame).toHaveBeenCalledWith(game);
//             expect(snackBarSpy.open).toHaveBeenCalledWith('Le jeu a été modifié avec succès !', undefined, {
//                 duration: SNACKBAR_DURATION,
//             });
//             expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
//         });
//     });

//     describe('createGame', () => {
//         const game: Game = {
//             ...GAME_PLACEHOLDER,
//             title: 'New Game',
//             description: 'This is a new game',
//             duration: 60,
//             questions: [],
//             lastModification: new Date().toISOString(),
//             visibility: true,
//         };

//         it('should create a new game', async () => {
//             communicationServiceSpy.addGame.and.returnValue(Promise.resolve());

//             await service.createGame(game);

//             expect(communicationServiceSpy.addGame).toHaveBeenCalledWith(game);
//             expect(snackBarSpy.open).toHaveBeenCalledWith('Le jeu a été créé avec succès !', undefined, {
//                 duration: SNACKBAR_DURATION,
//             });
//             expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
//         });

//         it('should display an error message if creating game fails', async () => {
//             communicationServiceSpy.addGame.and.throwError('Error creating game');

//             await service.createGame(game);

//             expect(communicationServiceSpy.addGame).toHaveBeenCalledWith(game);
//             expect(snackBarSpy.open).toHaveBeenCalledWith('Erreur lors de la création du jeu', undefined, {
//                 duration: SNACKBAR_DURATION,
//             });
//         });
//     });

//     describe('updateGame', () => {
//         const game: Game = {
//             ...GAME_PLACEHOLDER,
//             title: 'Updated Game',
//             description: 'This is an updated game',
//             duration: 120,
//             questions: [],
//             lastModification: new Date().toISOString(),
//             visibility: true,
//             gameId: '123',
//         };

//         it('should update the game', async () => {
//             communicationServiceSpy.editGame.and.returnValue(Promise.resolve());

//             await service.updateGame(game);

//             expect(communicationServiceSpy.editGame).toHaveBeenCalledWith(game);
//             expect(snackBarSpy.open).toHaveBeenCalledWith('Le jeu a été modifié avec succès !', undefined, {
//                 duration: SNACKBAR_DURATION,
//             });
//             expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
//         });

//         it('should display an error message if updating game fails', async () => {
//             communicationServiceSpy.editGame.and.throwError('Error updating game');

//             await service.updateGame(game);

//             expect(communicationServiceSpy.editGame).toHaveBeenCalledWith(game);
//             expect(snackBarSpy.open).toHaveBeenCalledWith('Erreur lors de la modification du jeu', undefined, {
//                 duration: SNACKBAR_DURATION,
//             });
//         });
//     });
// });
