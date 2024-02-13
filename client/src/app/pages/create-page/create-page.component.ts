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
import { Game, GAME_PLACEHOLDER } from '@app/interfaces/game';
import { EMPTY_QUESTION, Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { ValidationService } from '@app/services/validation.service';
import { MIN_DURATION, NOT_FOUND, SNACKBAR_DURATION } from '@common/constants';
import { lastValueFrom } from 'rxjs';

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
    pageTitle: string;
    showChildren: boolean = false;
    showPage: boolean = true;
    isEditing: boolean = false;
    questionTitleToEdit: string = '';

    login: boolean;
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    questions: Question[] = [];
    image: string;
    visibility: boolean;
    selectedQuestion: Question | null = null;

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private communicationService: CommunicationService,
        private validationService: ValidationService,
        private snackBar: MatSnackBar,
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
        const index = this.questions.findIndex((q) => q.text === question.text);
        if (index > NOT_FOUND) {
            this.questions[index] = question;
        } else {
            this.questions.push(question);
        }
    }
    insertQuestionFromBank(question: Question) {
        this.insertQuestion(question);
        this.closeQuestionBank();
    }
    insertQuestionFromCreate(question: Question) {
        if (this.questionTitleToEdit === '') {
            this.insertQuestion(question);
        } else {
            const index = this.questions.findIndex((q) => q.text === this.questionTitleToEdit);
            this.questions[index] = question;
            this.questionTitleToEdit = '';
        }
        this.closeCreateQuestion();
    }
    deleteQuestion(index: number): void {
        this.questions.splice(index, 1);
    }
    drop(event: CdkDragDrop<Question[]>): void {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }
    editQuestion(question: Question) {
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
    }
    async save(): Promise<void> {
        const gameToValidate: Partial<Game> = {
            title: this.title,
            description: this.description,
            duration: this.duration,
            questions: this.questions,
        };
        const validationErrors = this.validationService.validateGame(gameToValidate);
        if (validationErrors.length > 0) {
            this.snackBar.open('Erreurs de validation: \n' + validationErrors.join('\n'), undefined, {
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
        try {
            await lastValueFrom(this.communicationService.addGame(game));
            this.snackBar.open('Le jeu a été créé avec succès !', undefined, {
                duration: SNACKBAR_DURATION,
            });
            this.router.navigate(['/admin']);
        } catch (e) {
            this.snackBar.open('Erreur lors de la création du jeu', undefined, {
                duration: SNACKBAR_DURATION,
            });
        }
    }
    async updateGame(game: Game): Promise<void> {
        try {
            await lastValueFrom(this.communicationService.editGame(game));
            this.snackBar.open('Le jeu a été modifié avec succès !', undefined, {
                duration: SNACKBAR_DURATION,
            });
            this.router.navigate(['/admin']);
        } catch (e) {
            this.snackBar.open('Erreur lors de la modification du jeu', undefined, {
                duration: SNACKBAR_DURATION,
            });
        }
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
        this.communicationService.getGameById(gameId).subscribe({
            next: (game) => {
                this.fillForm(game, gameId);
            },
            error: () => {
                this.snackBar.open('Erreur lors du chargement du jeu', undefined, {
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
