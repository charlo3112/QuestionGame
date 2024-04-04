import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
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
    Grade = Grade;
    answers: QrlAnswer[] = [];
    question: Question = {
        type: QuestionType.QRL,
        text: 'Quelle est la couleur des pommes?',
        points: 69,
        choices: [],
    };

    gradeOptions = [
        { value: Grade.Ungraded, viewValue: 'Non noté' },
        { value: Grade.Zero, viewValue: '0' },
        { value: Grade.Half, viewValue: '0.5' },
        { value: Grade.One, viewValue: '1' },
    ];

    constructor() {
        this.answers = [
            { player: 'biscotte', text: 'les pommes sont rouges', grade: Grade.Ungraded },
            { player: 'abricot', text: 'pommes rouges', grade: Grade.Ungraded },
            { player: 'celeri', text: 'pommes sont bleues evidemment', grade: Grade.Ungraded },
        ];
    }

    ngOnInit() {
        this.sortAnswers();
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
}
