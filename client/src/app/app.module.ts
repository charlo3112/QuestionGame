import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
<<<<<<< HEAD
import { QuestionComponent } from './components/question/question.component';
import { MatButtonModule } from '@angular/material/button';
=======
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
import { AnswersComponent } from './components/answers/answers.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
<<<<<<< HEAD
    declarations: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        AdminPageComponent,
        QuestionComponent,
        AnswersComponent,
        MatGridListModule,
    ],
=======
    declarations: [AppComponent, GamePageComponent, MaterialPageComponent, PlayAreaComponent, SidebarComponent],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, AnswersComponent],
>>>>>>> cae3647 (Answer tiles added to view and component named "Answers")
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
