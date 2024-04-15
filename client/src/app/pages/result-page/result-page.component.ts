import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
    standalone: true,
    imports: [AppMaterialModule, ChatComponent, RouterModule, HistogramComponent, CommonModule, LeaderboardComponent],
})
export class ResultPageComponent implements OnDestroy, OnInit {
    constructor(private readonly gameService: GameService) {}

    async ngOnInit(): Promise<void> {
        await this.gameService.init();
    }

    ngOnDestroy(): void {
        this.gameService.leaveRoom();
    }
}
