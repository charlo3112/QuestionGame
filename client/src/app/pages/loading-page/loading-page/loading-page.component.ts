import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';

@Component({
    selector: 'app-loading-page',
    templateUrl: './loading-page.component.html',
    styleUrls: ['./loading-page.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, MatIconModule, MatButtonModule, MatTooltipModule, ChatComponent, MatToolbarModule, RouterModule, MatListModule],
})
export class LoadingPageComponent {
    playersPlaceHolder = ['Albert', 'George', 'John', 'Paul', 'Ringo'];
    roomLocked = false;
    readonly roomCode = 1234;
    isHost = true; // TODO: For host only functionalities

    onToggleLock() {
        this.roomLocked = !this.roomLocked;
        // TODO: Add logic to actually lock room!
    }

    onStartGame() {
        window.alert('Game started!');
        // TODO: Add logic to actually start game with right players
    }

    onKickPlayer(player: string) {
        this.playersPlaceHolder = this.playersPlaceHolder.filter((p) => p !== player);
        // TODO: Add logic to actually kick player and ban his name
    }
}
