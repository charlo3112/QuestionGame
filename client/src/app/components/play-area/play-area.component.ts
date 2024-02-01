import { NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { Choice } from '@app/interfaces/choice';
import { MouseButton } from '@app/interfaces/mouse-button';
import { Question } from '@app/interfaces/question';
import { TimeService } from '@app/services/time.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    standalone: true,
    imports: [NgIf, AnswersComponent, MatButtonModule],
})
export class PlayAreaComponent implements AfterViewInit, OnInit {
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

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

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
