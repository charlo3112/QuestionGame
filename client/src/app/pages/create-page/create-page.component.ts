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
    ],
})
export class CreatePageComponent {
    questions: string[] = [
        'Peut-on vraiment tout savoir ?',
        'Quel est le sens d’une bonne vie ?',
        'Y a-t-il un Dieu ?',
        'Qu’est-ce que la conscience ?',
        'Y a-t-il un ordre inhérent dans la nature ?',
        'Est-il plus important d’être respecté ou aimé ?',
        'Sommes-nous dans la Matrice ?',
        'Sommes-nous devenus moins heureux à l’ère de la technologie ?',
        'Qu’est-ce que les mathématiques ?',
        'Les humains sont-ils obligés de s’améliorer ?',
        'Y a-t-il un sens à la vie ?',
        'Avoir un gros ego est-il un trait négatif ou positif ?',
        'Existe-t-il une mortalité absolue ?',
        'Le but le plus important dans la vie est-il de trouver le bonheur ?',
        'Avons-nous le libre arbitre ?',
        'La vie a-t-elle besoin d’un but et d’un but ?',
        'Tueriez-vous 10 personnes pour en sauver 100 ?',
        'Qu’est-ce que le bonheur ?',
        'Comment les gens peuvent-​ils croire aux vérités sans preuves ?',
        'Est-il plus facile d’aimer ou d’être aimé ?',
        'Quelle est l’heure ?',
        'Les actes de bonté ont-ils un motif ?',
        'L’esprit ou la matière est-il plus réel ?',
        'L’amour est-il simplement un désir physique ou quelque chose de plus ?',
        'D’où viennent les pensées ?',
        'Le mal vient-il de l’intérieur, et si oui pourquoi ?',
        'Qu’est-ce que la beauté ?',
        'Où étaient les gens avant leur naissance ?',
        'Qu’est-ce que la véritable amitié ?',
        'Comment fonctionne la gravité ?',
    ];
    deleteQuestion(index: number): void {
        this.questions.splice(index, 1);
    }
    drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }
}
