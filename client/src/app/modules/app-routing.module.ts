import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { BankQuestionPageComponent } from '@app/pages/bank-question-page/bank-question-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LoadingPageComponent } from '@app/pages/loading-page/loading-page/loading-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { QuestionBankAdminComponent } from '@app/pages/question-bank-admin/question-bank-admin.component';
import { StartGamePageComponent } from '@app/pages/startgame-page/startgame-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'new', component: StartGamePageComponent },
    { path: 'admin/game/:id', component: MainPageComponent }, // TODO change this to add GameForm component
    { path: 'admin/game/', component: MainPageComponent }, // TODO change this to add GameForm component
    { path: 'admin/quiz', component: BankQuestionPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'loading', component: LoadingPageComponent },
    { path: 'admin/question-bank', component: QuestionBankAdminComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
