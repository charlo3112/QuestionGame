import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Question } from '@app/interfaces/question';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, RouterLink],
})
export class QuestionComponent {
    @Input() question: Question;
}
