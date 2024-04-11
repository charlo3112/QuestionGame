import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { AbandonDialogComponent } from './components/abandon-dialog/abandon-dialog.component';
import { AnswersComponent } from './components/answers/answers.component';
import { CreateQuestionComponent } from './components/create-question/create-question.component';
import { EraseHistoryDialogComponent } from './components/erase-history-dialog/erase-history-dialog.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { HistoryItemsComponent } from './components/history-items/history-items.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { HistoryPageComponent } from './pages/history-page/history-page.component';
import { QuestionBankPageComponent } from './pages/question-bank-page/question-bank-page.component';
import { ResultPageComponent } from './pages/result-page/result-page.component';
import { GameSubscriptionService } from './services/game-subscription/game-subscription.service';
import { GameService } from './services/game/game.service';
import { SessionStorageService } from './services/session-storage/session-storage.service';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [AppComponent],
    imports: [
        AbandonDialogComponent,
        AdminPageComponent,
        AnswersComponent,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ResultPageComponent,
        CreateQuestionComponent,
        CreatePageComponent,
        EraseHistoryDialogComponent,
        FormsModule,
        HistogramComponent,
        HistoryItemsComponent,
        HistoryPageComponent,
        HttpClientModule,
        LeaderboardComponent,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        QuestionBankComponent,
        QuestionBankPageComponent,
        ReactiveFormsModule,
        ResultPageComponent,
    ],
    providers: [CommunicationService, GameService, ValidationService, WebSocketService, SessionStorageService, GameSubscriptionService],
    bootstrap: [AppComponent],
})
export class AppModule {}
