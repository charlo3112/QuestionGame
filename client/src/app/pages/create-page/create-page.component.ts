import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { Game, GAME_PLACEHOLDER } from '@app/interfaces/game';
import { EMPTY_QUESTION, Question } from '@app/interfaces/question';
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
export class CreatePageComponent {
    showChildren: boolean = false;
    isEditing: boolean = false;

    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: string;
    questions: Question[] = [];
    image: string;
    isVisible: boolean;

    selectedQuestion: Question | null = null;

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
            if (!this.isEditing) {
                const gameCreated: Game = {
                    ...GAME_PLACEHOLDER,
                    title: this.title,
                    description: this.description,
                    duration: this.duration,
                    lastModification: new Date().toISOString(),
                    questions: this.questions,
                    visibility: false,
                };
                console.log(gameCreated);
            }
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
}
