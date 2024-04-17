import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, RouterModule],
})
export class MainPageComponent implements OnInit {
    constructor(private readonly gameService: GameService) {}

    ngOnInit(): void {
        this.gameService.leaveRoom();
    }
}
