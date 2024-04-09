import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Grade } from '@common/enums/grade';

@Component({
    selector: 'app-player-qrl',
    templateUrl: './player-qrl.component.html',
    styleUrls: ['./player-qrl.component.scss'],
    imports: [CommonModule, NgIf],
    standalone: true,
})
export class PlayerQRLComponent {
    @Input() grade: Grade = Grade.Ungraded;
    gradeValue = Grade;
    titleWithoutGrade: string = "Veuillez patienter, votre réponse est en cours d'évaluation";
    titleWithGrade: string = 'Voici votre note';
}
