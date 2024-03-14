import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';

@Component({
    selector: 'app-admin-game-view',
    templateUrl: './admin-game-view.component.component.html',
    styleUrls: ['./admin-game-view.component.component.scss'],
    standalone: true,
    imports: [LeaderboardComponent, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatToolbarModule, HistogramComponent],
})
export class AdminGameViewComponent {}
