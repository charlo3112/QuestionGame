import { NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AnswersComponent } from '@app/components/answers/answers.component';
import { MouseButton } from '@app/interfaces/mouse-button';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    standalone: true,
    imports: [NgIf, AnswersComponent, MatButtonModule],
})
export class PlayAreaComponent implements AfterViewInit {
    buttonPressed = '';
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

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.timeService.startTimer(this.timer);
        });
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
