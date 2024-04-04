import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { GameService } from '@app/services/game/game.service';
import { Grade } from '@common/enums/grade';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-admin-qrl',
    templateUrl: './admin-qrl.component.html',
    styleUrls: ['./admin-qrl.component.scss'],
    standalone: true,
    imports: [MatCardModule, MatFormFieldModule, MatSelectModule, CommonModule, MatButtonModule],
})
export class AdminQrlComponent implements OnInit {
    @Output() answersCorrected: EventEmitter<void> = new EventEmitter<void>();
    gradeSent: boolean = false;
    question: Question;
    answers: QrlAnswer[] = [
        {
            player: 'BOUCHE',
            text: 'ALLONS ENFANTS DE LA PATRIE',
            grade: Grade.Ungraded,
        },
        {
            player: 'ABRICOT',
            text: 'LE JOUR DE GLOIRE EST ARRIVÉ',
            grade: Grade.Ungraded,
        },
        {
            player: 'CERISE',
            text: 'CONTRE NOUS DE LA TYRANNIE',
            grade: Grade.Ungraded,
        },
    ];

    Grade = Grade;
    gradeOptions = [
        { value: Grade.Ungraded, viewValue: 'Non noté' },
        { value: Grade.Zero, viewValue: '0' },
        { value: Grade.Half, viewValue: '0.5' },
        { value: Grade.One, viewValue: '1' },
    ];

    constructor(readonly gameService: GameService) {}

    ngOnInit() {
        this.sortAnswers();
        if (this.gameService.currentQuestion) {
            this.question = this.gameService.currentQuestion;
        }
    }

    sortAnswers() {
        this.answers.sort((a, b) => a.player.localeCompare(b.player));
    }

    onGradeChange(index: number, newGrade: Grade) {
        this.answers[index].grade = newGrade;
    }

    allGraded(): boolean {
        return this.answers.every((answer) => answer.grade !== Grade.Ungraded);
    }

    sendGrades() {
        this.gameService.sendGrades(this.answers);
        this.gradeSent = true;
        this.answersCorrected.emit();
    }
}
