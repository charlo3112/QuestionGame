import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HistoryPageComponent } from '@app/pages/history-page/history-page.component';
import { JoinGamePageComponent } from '@app/pages/join-game-page/join-game-page.component';
import { LoadingPageComponent } from '@app/pages/loading-page/loading-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { QuestionBankPageComponent } from '@app/pages/question-bank-page/question-bank-page.component';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';
import { StartGamePageComponent } from '@app/pages/start-game-page/start-game-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'new', component: StartGamePageComponent },
    { path: 'admin/game/:id', component: CreatePageComponent },
    { path: 'admin/game', component: CreatePageComponent },
    { path: 'admin/history', component: HistoryPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'loading', component: LoadingPageComponent },
    { path: 'admin/question-bank', component: QuestionBankPageComponent },
    { path: 'join', component: JoinGamePageComponent },
    { path: 'results', component: ResultPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
