import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { StartGameExpansionComponent } from '@app/components/startgame-expansion/startgame-expansion.component';
import { Game } from '@app/interfaces/game';
import { Result } from '@app/interfaces/result';
import { CommunicationService } from '@app/services/communication.service';
import { Subscription } from 'rxjs';

// const description =
//     'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
//     ' Integer ullamcorper, leo vel elementum congue, libero leo pharetra nulla, sit amet pulvinar risus arcu ut nunc.' +
//     ' Curabitur at ipsum interdum, efficitur odio a, ornare lacus. Pellentesque blandit dui massa, in faucibus dui finibus a.' +
//     'Aenean et ex sed velit viverra porta. Fusce non blandit urna, eget pretium ligula. Fusce in commodo nulla. Phasellus a odio metus.';

@Component({
    selector: 'app-start-game-page',
    templateUrl: './startgame-page.component.html',
    styleUrls: ['./startgame-page.component.scss'],
    standalone: true,
    imports: [RouterModule, CommonModule, MatExpansionModule, StartGameExpansionComponent, MatToolbarModule, MatSnackBarModule],
})
export class StartGamePageComponent {
    // Template games to finish functionality
    games: Game[] = [];

    title: string = 'Liste de jeux';
    private subscription = new Subscription();
    constructor(
        private router: Router,
        private readonly communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {
        this.loadGames();
    }

    loadGames(): void {
        this.subscription.add(
            this.communicationService.getGames().subscribe({
                next: (result: Result<Game[]>) => {
                    if (result.ok && result.value) {
                        this.games = result.value;
                        this.games.forEach((game) => {
                            game.image = 'assets/logo.png';
                        });
                    } else {
                        this.openSnackBar('Error fetching games');
                    }
                },
                error: () => {
                    this.openSnackBar('Error fetching games');
                },
            }),
        );
    }

    openSnackBar(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 4000,
        });
    }
    refreshGames() {
        this.loadGames();
    }

    startGame(game: Game) {
        this.openSnackBar('Starting game : ' + game.title);
        // TODO: Add server call to start game (NOT FOR SPRINT 1)
        this.router.navigate(['/loading']);
    }

    testGame(game: Game) {
        this.router.navigate(['/game'], { state: { questions: game.questions } });
    }
}
