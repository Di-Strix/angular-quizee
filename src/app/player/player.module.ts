import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { SharedModule } from '../shared/shared.module';

import { PlayerRoutingModule } from './player-routing.module';
import { PlayerComponent } from './player.component';
import { QuizeeNotFoundComponent } from './quizee-not-found/quizee-not-found.component';

@NgModule({
  declarations: [PlayerComponent, QuizeeNotFoundComponent],
  imports: [CommonModule, PlayerRoutingModule, SharedModule, MatButtonModule],
})
export class PlayerModule {}
