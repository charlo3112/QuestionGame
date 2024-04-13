import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-text-answer',
    templateUrl: './text-answer.component.html',
    styleUrls: ['./text-answer.component.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule, MatInputModule, MatFormFieldModule],
})
export class TextAnswerComponent implements OnInit {
    @Input() isTextLocked: boolean;

    answer: string = '';
    constructor(readonly gameService: GameService) {}

    ngOnInit(): void {
        this.answer = '';
        this.isTextLocked = false;
    }

    onAnswerChange() {
        window.alert('Answer changed');
        this.gameService.sendActivityUpdate();
    }

    getAnswerClass() {
        return `answers-${this.answer}`;
    }
}
