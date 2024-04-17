import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { HistoryPageComponent } from './pages/history-page/history-page.component';
import { LoadingPageComponent } from './pages/loading-page/loading-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
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
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HistoryPageComponent,
        HttpClientModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        ResultPageComponent,
        GamePageComponent,
        MatDialogModule,
        LoadingPageComponent,
        MainPageComponent,
        AdminPageComponent,
        QuestionBankPageComponent,
    ],
    providers: [CommunicationService, GameService, ValidationService, WebSocketService, SessionStorageService, GameSubscriptionService],
    bootstrap: [AppComponent],
})
export class AppModule {}
