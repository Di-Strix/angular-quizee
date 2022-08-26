import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { PlayerRoutingModule } from './player-routing.module';
import { PlayerComponent } from './player.component';
import { QuizeeNotFoundComponent } from './quizee-not-found/quizee-not-found.component';

@NgModule({
  declarations: [PlayerComponent, QuizeeNotFoundComponent],
  imports: [CommonModule, PlayerRoutingModule, SharedModule],
})
export class PlayerModule {}
