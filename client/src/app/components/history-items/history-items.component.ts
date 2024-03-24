import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-history-items',
    templateUrl: './history-items.component.html',
    styleUrls: ['./history-items.component.scss'],
    standalone: true,
    imports: [MatCardModule, CommonModule],
})
export class HistoryItemsComponent {
    items = [
        {
            name: 'This is a very long game name for test purposes',
            date: new Date('2024-03-01'),
            numberPlayers: 4,
            bestScore: 100,
        },
        {
            name: 'Item 2',
            date: new Date('2024-03-08'),
            numberPlayers: 2,
            bestScore: 56,
        },
        {
            name: 'Item 3',
            date: new Date('2024-03-24'),
            numberPlayers: 5,
            bestScore: 78,
        },
    ];
}
