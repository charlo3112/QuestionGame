import { NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { MouseButton } from '@app/enums/mouse-button';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { TimeService } from '@app/services/time.service';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from '@app/components/chat/chat.component';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    standalone: true,
    imports: [NgIf, ChatComponent, MatIconModule, AnswersComponent, MatButtonModule, MatToolbarModule],
})
export class PlayAreaComponent implements AfterViewInit, OnInit {
    @Input() question: Question;
    choices: Choice[] = [];
    chat: string[] = [];
    chatInput: string = '';
    isChatFocused: boolean = false;

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
        if (this.isChatFocused) {
            return;
        }
        const key = event.key;
        if (key === 'Enter') {
            this.confirmQuestion();
        }
        const value = parseInt(key, 10) - 1;
        if (!isNaN(value) && value < this.choices.length) this.choices[value].isSelected = !this.choices[value].isSelected;
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
        return numCorrect === selectedCorrect;
    }

    confirmQuestion() {
        if (this.questionVerification()) {
            window.alert('Bonne reponse');
        } else {
            window.alert('Mauvaise reponse');
        }
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

    chatFocused(focus: boolean) {
        this.isChatFocused = focus;
    }
}
