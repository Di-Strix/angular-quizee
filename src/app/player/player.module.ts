import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SharedModule } from '../shared/shared.module';

import { PlayerRoutingModule } from './player-routing.module';
import { PlayerComponent } from './player.component';
import { PlayerService } from './player.service';
import { QuestionScreenComponent } from './question-screen/question-screen.component';
import { QuizeeLoaderComponent } from './quizee-loader/quizee-loader.component';
import { QuizeeNotFoundComponent } from './quizee-not-found/quizee-not-found.component';
import { ResultsLoaderComponent } from './results-loader/results-loader.component';

@NgModule({
  declarations: [
    PlayerComponent,
    QuizeeNotFoundComponent,
    QuestionScreenComponent,
    QuizeeLoaderComponent,
    ResultsLoaderComponent,
  ],
  imports: [CommonModule, PlayerRoutingModule, SharedModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  providers: [PlayerService],
})
export class PlayerModule {}
