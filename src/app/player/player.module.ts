import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { SharedModule } from '../shared/shared.module';

import { PlayerRoutingModule } from './player-routing.module';
import { PlayerComponent } from './player.component';
import { PlayerService } from './player.service';
import { QuestionScreenComponent } from './question-screen/question-screen.component';
import { QuizeeNotFoundComponent } from './quizee-not-found/quizee-not-found.component';

@NgModule({
  declarations: [PlayerComponent, QuizeeNotFoundComponent, QuestionScreenComponent],
  imports: [CommonModule, PlayerRoutingModule, SharedModule, MatButtonModule],
  providers: [PlayerService],
})
export class PlayerModule {}
