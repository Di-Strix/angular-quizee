import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SharedModule } from '../shared/shared.module';

import { PlayerRoutingModule } from './player-routing.module';
import { PlayerComponent } from './player.component';
import { PlayerService } from './player.service';
import { OneTrueComponent } from './question-screen/one-true/one-true.component';
import { QuestionScreenComponent } from './question-screen/question-screen.component';
import { SeveralTrueComponent } from './question-screen/several-true/several-true.component';
import { WriteAnswerComponent } from './question-screen/write-answer/write-answer.component';
import { QuizeeLoaderComponent } from './quizee-loader/quizee-loader.component';
import { QuizeeNotFoundComponent } from './quizee-not-found/quizee-not-found.component';
import { ResultsLoaderComponent } from './results-loader/results-loader.component';
import { ResultsScreenComponent } from './results-screen/results-screen.component';

@NgModule({
  declarations: [
    PlayerComponent,
    QuizeeNotFoundComponent,
    QuestionScreenComponent,
    QuizeeLoaderComponent,
    ResultsLoaderComponent,
    ResultsScreenComponent,
    OneTrueComponent,
    SeveralTrueComponent,
    WriteAnswerComponent,
  ],
  imports: [
    CommonModule,
    PlayerRoutingModule,
    SharedModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [PlayerService],
})
export class PlayerModule {}
