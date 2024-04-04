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
import { AdminService } from '@app/services/admin/admin.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { QuestionInsertionService } from '@app/services/question-creation/question-insertion.service';
import { MIN_DURATION, SNACKBAR_DURATION } from '@common/constants';
import { Game } from '@common/interfaces/game';
import { EMPTY_QUESTION, Question } from '@common/interfaces/question';

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
        private readonly gameCreationService: GameCreationService,
        private readonly questionInsertionService: QuestionInsertionService,
        private readonly adminService: AdminService,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        if (!this.adminService.login) {
            this.router.navigate(['/admin']);
            return;
        }

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
    }
    insertQuestion(question: Question): void {
        this.questionInsertionService.insertQuestion(question, this.questions);
    }
    insertQuestionFromBank(question: Question) {
        this.questionInsertionService.insertQuestionFromBank(question, this.isEditingQuestion, this.questions);
        this.closeQuestionBank();
    }
    insertQuestionFromCreate(question: Question) {
        this.questionInsertionService.insertQuestionFromCreate(question, this.isEditingQuestion, this.questionTitleToEdit, this.questions);
        this.closeCreateQuestion();
    }
    verifyPresenceQuestion(question: Question): boolean {
        return this.questionInsertionService.verifyQuestion(question, this.questions, this.isEditingQuestion);
    }
    deleteQuestion(index: number): void {
        this.questionInsertionService.deleteQuestion(index, this.questions);
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
        this.gameCreationService.save(this.title, this.description, this.duration, this.questions, this.visibility, this.id, this.isEditing);
    }

    async createGame(game: Game): Promise<void> {
        this.gameCreationService.createGame(game);
    }

    async updateGame(game: Game): Promise<void> {
        this.gameCreationService.updateGame(game);
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
