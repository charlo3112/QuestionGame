import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
    standalone: true,
    imports: [MatToolbarModule, ChatComponent],
})
export class ResultPage implements OnInit {
    constructor(private router: Router) {}
    ngOnInit() {}
}
