import { NgIf } from '@angular/common';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a04df5f (tests upated)
import { AfterViewInit, Component, HostListener, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { Choice } from '@app/interfaces/choice';
import { MouseButton } from '@app/interfaces/mouse-button';
import { Question } from '@app/interfaces/question';
=======
import { AfterViewInit, Component, HostListener } from '@angular/core';
=======
import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
>>>>>>> deef9e6 (interface question utilise)
import { MatButtonModule } from '@angular/material/button';
import { AnswersComponent } from '@app/components/answers/answers.component';
<<<<<<< HEAD
import { MouseButton } from '@app/enums/mouse-button';
>>>>>>> 1875ebf (game-page remodel)
=======
import { MouseButton } from '@app/interfaces/mouse-button';
<<<<<<< HEAD
>>>>>>> 479dc8c (enums folder deleted)
=======
import { Question } from '@app/interfaces/question';
>>>>>>> deef9e6 (interface question utilise)
import { TimeService } from '@app/services/time.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { QuestionComponent } from '../question/question.component';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    standalone: true,
<<<<<<< HEAD
<<<<<<< HEAD
    imports: [NgIf, AnswersComponent, MatButtonModule, MatToolbarModule, QuestionComponent],
=======
    imports: [NgIf, AnswersComponent],
>>>>>>> 1875ebf (game-page remodel)
=======
    imports: [NgIf, AnswersComponent, MatButtonModule],
>>>>>>> 60d6fe0 (confirm button changed to angular material and changd style)
})
<<<<<<< HEAD
<<<<<<< HEAD
export class PlayAreaComponent implements AfterViewInit, OnInit {
=======
export class PlayAreaComponent implements AfterViewInit {
>>>>>>> deef9e6 (interface question utilise)
=======
export class PlayAreaComponent implements AfterViewInit, OnInit {
>>>>>>> a04df5f (tests upated)
    @Input() question: Question;
    buttonPressed = '';
    choices: Choice[] = [];
    private readonly timer = 60;
    constructor(private readonly timeService: TimeService) {}

    get score(): number {
        return 3;
    }
    get time(): number {
        return this.timeService.time;
    }

    styleTime(): string {
        return "background-position: bottom -100% right 0%";
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a04df5f (tests upated)
    ngOnInit(): void {
        if (this.question) {
            this.populateChoices();
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.timeService.startTimer(this.timer);
        });
    }

    populateChoices() {
        const numberChoices = this.question.choices.length;
        for (let i = 0; i < numberChoices; i++) {
            this.choices.push(this.question.choices[i]);
        }
    }

<<<<<<< HEAD
    confirmQuestion() {
        window.alert('Question confirmée');
    }

    chatConfirm() {
        window.alert('Bienvenu au chat');
=======
    ngAfterViewInit(): void {
<<<<<<< HEAD
        this.timeService.startTimer(this.timer);
>>>>>>> 209120a (enums folder created)
=======
        setTimeout(() => {
            this.timeService.startTimer(this.timer);
        });
>>>>>>> 85e3ff3 (new tests created pass)
    }

=======
>>>>>>> 6046b70 (Removed mat-grid-list, dynamique number of answers in the question)
    confirmQuestion() {
        window.alert('Question confirmée');
    }

    chatConfirm() {
        window.alert('Bienvenu au chat');
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.startTimer(this.timer);
        }
    }
}
