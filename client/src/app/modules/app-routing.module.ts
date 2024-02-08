import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { StartGamePageComponent } from '@app/pages/startgame-page/startgame-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'new', component: StartGamePageComponent },
    { path: 'admin/game/:id', component: CreatePageComponent }, // TODO change this to add GameForm component
    { path: 'create-question', component: CreateQuestionComponent },
    { path: 'admin/game', component: CreatePageComponent }, // TODO change this to add GameForm component
    { path: 'admin/quiz/', component: MainPageComponent }, // TODO change this to add GameForm component
    { path: 'admin', component: AdminPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
