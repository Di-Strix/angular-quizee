import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { PlayerComponent } from './player.component';
import { QuizeeNotFoundComponent } from './quizee-not-found/quizee-not-found.component';

const routes: Route[] = [
  { path: '404', pathMatch: 'full', component: QuizeeNotFoundComponent },
  { path: ':id', component: PlayerComponent },
  { path: '', pathMatch: 'full', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerRoutingModule {}
