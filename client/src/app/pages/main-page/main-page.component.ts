import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    standalone: true,
    imports: [MatButtonModule, RouterModule],
})
export class MainPageComponent implements OnInit {
    constructor(private readonly gameService: GameService) {}

    ngOnInit(): void {
        this.gameService.leaveRoom();
    }
}
