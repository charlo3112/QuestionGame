import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { GAME_PLACEHOLDER, Game } from '@app/interfaces/game';
import { EMPTY_QUESTION, Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { MIN_DURATION, NOT_FOUND, SNACKBAR_DURATION } from '@common/constants';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        RouterModule,
        DragDropModule,
        CreatePageComponent,
        CreateQuestionComponent,
        FormsModule,
        RouterLink,
        MatToolbarModule,
        MatCardModule,
        QuestionBankComponent,
    ],
})
export class CreatePageComponent implements OnInit {
    description: string;
    duration: number;
    id: string;
    isEditing: boolean = false;
    login: boolean;
    pageTitle: string;
    questions: Question[] = [];
    questionTitleToEdit: string = '';
    selectedQuestion: Question | null = null;
    showChildren: boolean = false;
    showPage: boolean = true;
    isEditingQuestion: boolean = false;
    title: string;
    visibility: boolean;

    // We had to disable the max-params rule because we need every parameter for the component to work
    // eslint-disable-next-line max-params
    constructor(
        private readonly communicationService: CommunicationService,
        private readonly validationService: ValidationService,
        private readonly gameCreationService: GameCreationService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {}
    ngOnInit() {
        if (this.verifyLogin()) {
            this.route.paramMap.subscribe((params) => {
                const gameId = params.get('id');
                if (gameId) {
                    this.pageTitle = "Édition d'un jeu existant";
                    this.loadGameData(gameId);
                } else {
                    this.pageTitle = "Création d'un nouveau jeu";
                    this.resetForm();
                }
            });
        } else {
            this.router.navigate(['/admin']);
        }
    }
    insertQuestion(question: Question): void {
        this.gameCreationService.insertQuestion(question, this.questions);
    }
    insertQuestionFromBank(question: Question) {
        if (this.verifyPresenceQuestion(question)) {
            this.insertQuestion(question);
        }
        this.closeQuestionBank();
    }
    insertQuestionFromCreate(question: Question) {
        if (this.verifyPresenceQuestion(question)) {
            if (!this.questionTitleToEdit.length) {
                this.insertQuestion(question);
            } else {
                const index = this.questions.findIndex((q) => q.text === this.questionTitleToEdit);
                this.questions[index] = question;
                this.questionTitleToEdit = '';
                this.isEditingQuestion = false;
            }
        }
        this.closeCreateQuestion();
    }
    verifyPresenceQuestion(question: Question): boolean {
        const SAME_TEXT_QUESTION = "Une question avec le même texte est déjà présente ! Votre question n'a pas été ajoutée.";
        const index = this.questions.findIndex((q) => q.text === question.text);
        if (index !== NOT_FOUND) {
            if (this.isEditingQuestion) {
                return true;
            }
            this.snackBar.open(SAME_TEXT_QUESTION, undefined, {
                duration: SNACKBAR_DURATION,
            });
            return false;
        } else {
            return true;
        }
    }
    deleteQuestion(index: number): void {
        this.questions.splice(index, 1);
    }
    drop(event: CdkDragDrop<Question[]>): void {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }
    editQuestion(question: Question) {
        this.isEditingQuestion = true;
        this.questionTitleToEdit = question.text;
        this.selectedQuestion = question;
        this.showChildren = true;
    }
    openQuestionBank() {
        this.showPage = false;
        this.selectedQuestion = EMPTY_QUESTION;
    }
    closeQuestionBank() {
        this.showPage = true;
    }
    openCreateQuestion() {
        this.showChildren = true;
        this.selectedQuestion = EMPTY_QUESTION;
    }
    closeCreateQuestion() {
        this.showChildren = false;
        this.isEditingQuestion = false;
    }
    async save(): Promise<void> {
        const ERROR_VALIDATION = 'Erreurs de validation: \n';
        const gameToValidate: Partial<Game> = {
            title: this.title,
            description: this.description,
            duration: this.duration,
            questions: this.questions,
        };
        const validationErrors = this.validationService.validateGame(gameToValidate);
        if (validationErrors.length > 0) {
            this.snackBar.open(ERROR_VALIDATION + validationErrors.join('\n'), undefined, {
                duration: SNACKBAR_DURATION,
            });
            return;
        }
        const newGame: Game = {
            ...GAME_PLACEHOLDER,
            ...gameToValidate,
            lastModification: new Date().toISOString(),
            visibility: this.visibility,
        };

        if (this.isEditing) {
            newGame.gameId = this.id;
            await this.updateGame(newGame);
        } else {
            await this.createGame(newGame);
        }
    }

    async createGame(game: Game): Promise<void> {
        this.gameCreationService.createGame(game);
    }
    async updateGame(game: Game): Promise<void> {
        this.gameCreationService.updateGame(game);
    }
    verifyLogin(): boolean {
        const storedLogin = sessionStorage.getItem('login');
        if (storedLogin !== null) {
            this.login = JSON.parse(storedLogin);
        } else {
            this.login = false;
            sessionStorage.setItem('login', JSON.stringify(this.login));
        }
        return this.login;
    }

    loadGameData(gameId: string) {
        const ERROR_LOADING_GAME = 'Erreur lors du chargement du jeu';
        this.communicationService.getGameById(gameId).subscribe({
            next: (game) => {
                this.fillForm(game, gameId);
            },
            error: () => {
                this.snackBar.open(ERROR_LOADING_GAME, undefined, {
                    duration: SNACKBAR_DURATION,
                });
                this.router.navigate(['/admin']);
            },
        });
    }

    fillForm(game: Game, id: string) {
        this.isEditing = true;
        this.id = id;
        this.title = game.title;
        this.description = game.description;
        this.duration = game.duration;
        this.questions = game.questions;
        this.visibility = game.visibility;
    }

    resetForm() {
        this.isEditing = false;
        this.title = '';
        this.description = '';
        this.duration = MIN_DURATION;
        this.questions = [];
        this.visibility = false;
    }
}
