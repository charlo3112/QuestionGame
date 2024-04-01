import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { WebSocketService } from '@app/services/websocket/websocket.service';
import { GameService } from './services/game/game.service';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [AppComponent],
    imports: [AdminPageComponent, AppRoutingModule, BrowserAnimationsModule, BrowserModule, HttpClientModule],
    providers: [CommunicationService, GameService, ValidationService, WebSocketService],
    bootstrap: [AppComponent],
})
export class AppModule {}
