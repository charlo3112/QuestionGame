import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { EMPTY_QUESTION, Question, QuestionType } from '../../interfaces/question';

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
    ],
})
export class CreatePageComponent {
    showChildren: boolean = false;
    selectedQuestion: Question | null = null;
    questions: Question[] = [
        {
            type: QuestionType.Qcm,
            text: 'Peut-on vraiment tout savoir ?',
            points: 60,
            choices: [
                { text: 'Oui', isCorrect: false },
                { text: 'Non', isCorrect: true },
                { text: 'Peut-être', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Quel est le sens d’une bonne vie ?',
            points: 20,
            choices: [
                { text: 'Le bonheur', isCorrect: false },
                { text: 'La connaissance', isCorrect: false },
                { text: 'Les contributions à la société', isCorrect: true },
                { text: 'Les relations', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Y a-t-il un Dieu ?',
            points: 60,
            choices: [
                { text: 'Oui', isCorrect: true },
                { text: 'Non', isCorrect: false },
                { text: 'Incertain', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Qu’est-ce que la conscience ?',
            points: 40,
            choices: [
                { text: 'La perception de soi', isCorrect: true },
                { text: 'Une illusion', isCorrect: false },
                { text: 'Un processus biologique', isCorrect: false },
                { text: 'Inexpliqué', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Le mal vient-il de l’intérieur, et si oui pourquoi ?',
            points: 10,
            choices: [
                { text: 'Oui, il est le produit de nos désirs et émotions', isCorrect: true },
                { text: 'Non, il est influencé par des facteurs externes', isCorrect: false },
                { text: 'Il provient de l’ignorance', isCorrect: false },
                { text: 'Il est une construction sociale', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Qu’est-ce que la beauté ?',
            points: 10,
            choices: [
                { text: 'Une harmonie perceptible par les sens', isCorrect: true },
                { text: 'Une norme culturelle variable', isCorrect: false },
                { text: 'Un concept purement subjectif', isCorrect: false },
                { text: 'Une idée innée et universelle', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Où étaient les gens avant leur naissance ?',
            points: 10,
            choices: [
                { text: 'Dans un état non-existant', isCorrect: true },
                { text: 'En attente de leur tour pour la vie', isCorrect: false },
                { text: 'Dans une vie antérieure', isCorrect: false },
                { text: 'Dans un lieu spirituel', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Qu’est-ce que la véritable amitié ?',
            points: 10,
            choices: [
                { text: 'Un lien inconditionnel entre individus', isCorrect: true },
                { text: 'Une relation basée sur l’intérêt mutuel', isCorrect: false },
                { text: 'Une connexion qui survit à l’épreuve du temps', isCorrect: false },
                { text: 'Un soutien constant, peu importe les circonstances', isCorrect: false },
            ],
        },
        {
            type: QuestionType.Qcm,
            text: 'Comment fonctionne la gravité ?',
            points: 10,
            choices: [
                { text: 'Par l’attraction entre masses', isCorrect: true },
                { text: 'Grâce à l’énergie noire', isCorrect: false },
                { text: 'Comme un effet de la courbure de l’espace-temps', isCorrect: false },
                { text: 'À travers le magnétisme planétaire', isCorrect: false },
            ],
        },
    ];
    insertQuestion(question: Question) {
        const index = this.questions.findIndex((q) => q.text === question.text);
        if (index > -1) {
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
    save(): void {}
}
