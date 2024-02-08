import { NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { MouseButton } from '@app/enums/mouse-button';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    standalone: true,
    imports: [NgIf, AnswersComponent, MatButtonModule, MatToolbarModule],
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

    questionVerification() {
        let numCorrect = 0;
        let selectedCorrect = 0;
        for (const choice of this.choices) {
            if (choice.isCorrect) {
                numCorrect++;
            }
            if (choice.isSelected && choice.isCorrect) {
                selectedCorrect++;
            }
        }
        if (numCorrect === selectedCorrect) {
            return true;
        }
        return false;
    }

    confirmQuestion() {
        if (this.questionVerification()) {
            window.alert('Bonne reponse');
        } else {
            window.alert('Mauvaise reponse');
        }
    }

    chatConfirm() {
        window.alert('Bienvenu au chat');
    }

    abandonnerPartie() {
        window.alert('Partie abandonnée');
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.timeService.startTimer(this.timer);
        }
    }
}
