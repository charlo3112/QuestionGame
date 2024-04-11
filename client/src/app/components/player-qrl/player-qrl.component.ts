import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { GameSubscriptionService } from '@app/services/game-subscription/game-subscription.service';
import { GameService } from '@app/services/game/game.service';
import { Grade } from '@common/enums/grade';

@Component({
    selector: 'app-player-qrl',
    templateUrl: './player-qrl.component.html',
    styleUrls: ['./player-qrl.component.scss'],
    imports: [CommonModule, NgIf],
    standalone: true,
})
export class PlayerQRLComponent {
    grade: Grade = Grade.Ungraded;
    gradeValue = Grade;
    titleWithoutGrade: string = "Veuillez patienter, votre réponse est en cours d'évaluation";
    titleWithGrade: string = 'Voici votre note';

    constructor(
        readonly gameService: GameService,
        public gameSubscriptionService: GameSubscriptionService,
    ) {}
}
