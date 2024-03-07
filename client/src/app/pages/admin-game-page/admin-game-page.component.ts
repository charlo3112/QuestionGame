import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ChoiceWithCounter } from '@app/classes/choice';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { PLAYERS, Player } from '@app/interfaces/player';
import { QUESTIONS_PLACEHOLDER, Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game.service';
import { QuestionType } from '@common/constants';

@Component({
    selector: 'app-admin-game-page',
    templateUrl: './admin-game-page.component.html',
    styleUrls: ['./admin-game-page.component.scss'],
    imports: [
        ChatComponent,
        LeaderboardComponent,
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        MatToolbarModule,
        HistogramComponent,
    ],
    standalone: true,
})
export class AdminGamePageComponent implements OnInit {
    choix1question1 = new ChoiceWithCounter('Guillaume en boit', true, 5);
    choix2question1 = new ChoiceWithCounter('Guillaume en a apporté 2 boites', false, 3);
    choix3question1 = new ChoiceWithCounter("C'est du lichi", false, 2);
    question1: Question = {
        type: QuestionType.QCM,
        text: "Pourquoi le jus de lichi n'est pas bon?",
        points: 69,
        choices: [this.choix1question1, this.choix2question1, this.choix3question1],
    };
    choix1question2 = new ChoiceWithCounter('Les temps de compilation sont abominables', false, 1);
    choix2question2 = new ChoiceWithCounter("C'est quoi cette question?", true, 4);
    choix3question2 = new ChoiceWithCounter('Le javascript est une erreur.', true, 156);
    choix4question2 = new ChoiceWithCounter('Les deux sont horribles', false, 2);
    question2: Question = {
        type: QuestionType.QCM,
        text: 'Pourquoi le Rust est un langage supérieur pour le frontend?',
        points: 42,
        choices: [this.choix1question2, this.choix2question2, this.choix3question2, this.choix4question2],
    };
    choix1question3 = new ChoiceWithCounter('Premier choix', true, 1);
    choix2question3 = new ChoiceWithCounter('Deuxieme choix', false, 8);
    question3: Question = {
        type: QuestionType.QCM,
        text: 'Question 3',
        points: 42,
        choices: [this.choix1question3, this.choix2question3],
    };
    currentQuestionIndex = 1;
    question: Question;
    gameQuestions: Question[] = [this.question1, this.question2, this.question3];
    leaderboard: Player[] = [];

    constructor(readonly gameService: GameService) {}

    ngOnInit(): void {
        this.fetchQuestion();
        this.fetchLeaderboard();
    }

    fetchLeaderboard() {
        this.leaderboard = PLAYERS;
        this.leaderboard.sort((a, b) => {
            return b.score - a.score;
        });
        // this.communicationService.getPlayers().subscribe({
        //     next: (response: Result<Player[]>) => {
        //         if (!response.ok) {
        //             throw new Error('Error fetching questions');
        //         }
        //         this.leaderboard = response.value;
        //         this.leaderboard.sort((a, b) => {
        //             return b.score - a.score;
        //         });
        //     },
        //     error: () => {
        //         throw new Error('Error fetching questions');
        //     },
        // });
    }

    fetchQuestion() {
        this.question = QUESTIONS_PLACEHOLDER[0];
    }
}
