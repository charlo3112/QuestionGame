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
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { AnswersComponent } from './components/answers/answers.component';
import { CreateQuestionComponent } from './components/create-question/create-question.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { QuestionBankPageComponent } from './pages/question-bank-page/question-bank-page.component';
import { HistogramComponent } from './histogram/histogram.component';
import { ScoreBoardComponent } from './score-board/score-board.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [AppComponent, HistogramComponent, ScoreBoardComponent],
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
        CreatePageComponent,
        CreateQuestionComponent,
        AnswersComponent,
        MatGridListModule,
        QuestionBankComponent,
        QuestionBankPageComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
