import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { Game, GAME_PLACEHOLDER } from '@app/interfaces/game';
import { EMPTY_QUESTION, Question } from '@app/interfaces/question';
import { CommunicationService } from '@app/services/communication.service';
import { MAX_DURATION, MIN_DURATION, MIN_QUESTION_NUMBER, NOT_FOUND } from '@common/constants';

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
    ],
})
export class CreatePageComponent implements OnInit {
    pageTilte: string;
    showChildren: boolean = false;
    isEditing: boolean = false;

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

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private communicationService: CommunicationService,
    ) {}

    ngOnInit() {
        if (this.verifyLogin()) {
            this.route.paramMap.subscribe((params) => {
                const gameId = params.get('id');
                if (gameId) {
                    this.pageTilte = "Édition d'un jeu existant";
                    this.loadGameData(gameId);
                } else {
                    this.pageTilte = "Création d'un nouveau jeu";
                    this.resetForm();
                }
            });
        } else {
            this.router.navigate(['/admin']);
        }
    }

    private verifyLogin(): boolean {
        const storedLogin = sessionStorage.getItem('login');
        if (storedLogin !== null) {
            this.login = JSON.parse(storedLogin);
        } else {
            this.login = false;
            sessionStorage.setItem('login', JSON.stringify(this.login));
        }
        return this.login;
    }
    private loadGameData(gameId: string) {
        this.communicationService.getGameById(gameId).subscribe({
            next: (game) => {
                this.fillForm(game, gameId);
            },
            error: (error) => {
                console.error('Erreur lors du chargement du jeu', error);
            },
        });
    }

    private fillForm(game: Game, id: string) {
        this.isEditing = true;
        this.id = id;
        this.title = game.title;
        this.description = game.description;
        this.duration = game.duration;
        this.questions = game.questions;
        this.visibility = game.visibility;
    }

    private resetForm() {
        this.isEditing = false;
        this.title = '';
        this.description = '';
        this.duration = MIN_DURATION;
        this.questions = [];
        this.visibility = false;
    }

    insertQuestion(question: Question) {
        const index = this.questions.findIndex((q) => q.text === question.text);
        if (index > NOT_FOUND) {
            this.questions[index] = question;
        } else {
            this.questions.push(question);
        }
        this.closeCreateQuestion();
    }
    deleteQuestion(index: number): void {
        this.questions.splice(index, 1);
    }
    drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }
    editQuestion(question: Question) {
        this.selectedQuestion = question;
        this.showChildren = true;
    }
    openCreateQuestion() {
        this.showChildren = true;
        this.selectedQuestion = EMPTY_QUESTION;
    }
    closeCreateQuestion() {
        this.showChildren = false;
    }
    save(): void {
        if (this.checkFields()) {
            const newGame: Game = {
                ...GAME_PLACEHOLDER,
                title: this.title,
                description: this.description,
                duration: this.duration,
                lastModification: new Date().toISOString(),
                questions: this.questions,
                visibility: false,
            };
            if (this.isEditing) {
                newGame.gameId = this.id;
                this.updateGame(newGame);
            } else {
                this.createGame(newGame);
            }
            this.router.navigate(['/admin']);
        }
    }
    checkFields(): boolean {
        if (!this.title || this.title.trim().length === 0) {
            window.alert('Veuillez entrer un nom pour le jeu.');
            return false;
        }
        if (!this.description || this.description.trim().length === 0) {
            window.alert('Veuillez entrer une description pour le jeu.');
            return false;
        }
        if (this.duration < MIN_DURATION || this.duration > MAX_DURATION) {
            window.alert('Le temps alloué doit être compris entre 10 et 60.');
            return false;
        }
        if (this.questions.length < MIN_QUESTION_NUMBER) {
            window.alert('Le jeu doit au moins avoir une question.');
            return false;
        }
        return true;
    }
    private createGame(game: Game): void {
        this.communicationService.addGame(game).subscribe({
            next: (response) => {
                window.alert('Jeu ' + game.title + ' a été créer avec succès');
            },
            error: (error) => {
                window.alert('Erreur lors de la création du jeu');
            },
        });
    }
    private updateGame(game: Game): void {
        this.communicationService.editGame(game).subscribe({
            next: (response) => {
                window.alert('Jeu ' + game.title + ' a été modifié avec succès');
            },
            error: (error) => {
                window.alert('Erreur lors de la mise à jour du jeu');
            },
        });
    }
}
