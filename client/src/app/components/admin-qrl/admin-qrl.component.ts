import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { GameService } from '@app/services/game/game.service';
import { Grade } from '@common/enums/grade';
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
    @Input() answers = this.gameService.qrlAnswers;
    gradeSent: boolean = false;
    question: Question;

    grade = Grade;
    gradeOptions = [
        { value: Grade.Ungraded, viewValue: 'Non noté' },
        { value: Grade.Zero, viewValue: '0' },
        { value: Grade.Half, viewValue: '0.5' },
        { value: Grade.One, viewValue: '1' },
    ];

    constructor(readonly gameService: GameService) {}

    ngOnInit(): void {
        this.sortAnswers();
        if (this.gameService.currentQuestion) {
            this.question = this.gameService.currentQuestion;
        }
    }

    sortAnswers(): void {
        this.answers.sort((a, b) => a.user.localeCompare(b.user));
    }

    onGradeChange(index: number, newGrade: Grade): void {
        this.answers[index].grade = newGrade;
    }

    allGraded(): boolean {
        return this.answers.every((answer) => answer.grade !== Grade.Ungraded);
    }

    sendGrades(): void {
        this.gameService.sendGrades(this.answers);
        this.gradeSent = true;
        this.answersCorrected.emit();
    }
}
